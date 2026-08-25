from __future__ import annotations

import re

from ..log import setup_logging
from ..llm.tool_utils import extract_tool_args, get_tool_call_name
from .processing import (
  _normalize_context_msg_id,
  _normalize_preview_text,
  EMPTY_TARGET_TOKENS,
)

logger = setup_logging()

ACTION_LINE_RE = re.compile(r"^\[?\s*(REPLY_TO|REACT_TO|STICKER)\s*[:=]\s*(.*?)\s*\]?$", re.IGNORECASE)
REACT_TOKEN_RE = re.compile(r"^(.+?)@(\d{6})$")


def _contains_tool_call_xml(text: str) -> bool:
  """Detect leaked XML tool_call syntax that must never reach the chat."""
  if not text:
    return False
  lowered = text.lower()
  return "<tool_call>" in lowered or "<function=" in lowered or "</tool_call>" in lowered or "<parameter=" in lowered


def _extract_tool_call_from_xml(text: str) -> list[dict]:
  """Parse leaked XML tool_call into proper action dicts."""
  actions: list[dict] = []
  pattern = re.compile(
    r"<function=([^>]+)>(.*?)</function>",
    re.DOTALL | re.IGNORECASE,
  )
  for match in pattern.finditer(text):
    func_name = match.group(1).strip().lower()
    params_raw = match.group(2)
    params: dict[str, str] = {}
    param_pattern = re.compile(
      r"<parameter=([^>]+)>([^<]*)</parameter>",
      re.DOTALL | re.IGNORECASE,
    )
    for pm in param_pattern.finditer(params_raw):
      key = pm.group(1).strip().lower()
      value = pm.group(2).strip()
      params[key] = value

    if func_name == "reply_message":
      reply_text = params.get("text", "").strip()
      if reply_text:
        actions.append({
          "type": "send_message",
          "text": reply_text,
          "replyTo": params.get("context_msg_id") or None,
        })
      raw_command = params.get("command", "").strip()
      if raw_command and raw_command.lower() not in {"null", "none", "nil", "/"}:
        if not raw_command.startswith("/"):
          raw_command = "/" + raw_command
        actions.append({
          "type": "run_command",
          "command": raw_command,
          "contextMsgId": params.get("command_context_msg_id") or params.get("context_msg_id") or None,
        })
    elif func_name == "react_to_message":
      emoji = params.get("emoji", "").strip()
      ctx_id = params.get("context_msg_id", "").strip()
      if emoji and ctx_id:
        actions.append({
          "type": "react_message",
          "contextMsgId": ctx_id,
          "emoji": emoji,
        })
    elif func_name == "send_sticker":
      sticker_name = params.get("sticker_name", "").strip()
      ctx_id = params.get("context_msg_id", "").strip()
      if sticker_name and ctx_id:
        actions.append({
          "type": "send_sticker",
          "stickerName": sticker_name,
          "replyTo": ctx_id,
        })
  return actions


def _extract_reply_text(msg) -> str | None:
  if hasattr(msg, "content") and isinstance(msg.content, str):
    return msg.content.strip()
  if hasattr(msg, "content") and isinstance(msg.content, list):
    parts = [part for part in msg.content if isinstance(part, str)]
    return "\n".join(parts).strip() if parts else None
  return None


def _is_empty_target_token(value: str | None) -> bool:
  if value is None:
    return True
  return value.strip().lower() in EMPTY_TARGET_TOKENS


def _unwrap_angle_group(value: str | None) -> str:
  return "" if value is None else str(value).strip()


def _resolve_reply_target(
  token: str | None,
  *,
  fallback_reply_to: str | None,
  allowed_context_ids: set[str],
) -> str | None:
  if token is None:
    return fallback_reply_to
  token_value = _unwrap_angle_group(token)
  if not token_value:
    return None
  lowered = token_value.lower()
  if lowered in EMPTY_TARGET_TOKENS:
    return None
  normalized = _normalize_context_msg_id(token_value)
  if not normalized:
    logger.warning("reply target ignored: invalid context id token=%r", token)
    return None
  if allowed_context_ids and normalized not in allowed_context_ids:
    logger.warning("reply target ignored: context id %s not present in allowed context ids", normalized)
    return None
  return normalized


def _parse_react_context_ids(
  token: str | None,
  *,
  allowed_context_ids: set[str],
) -> list[str]:
  token_value = _unwrap_angle_group(token)
  if not token_value:
    return []
  if _is_empty_target_token(token_value):
    return []

  result: list[str] = []
  seen: set[str] = set()
  for segment in token_value.split(","):
    cleaned = _unwrap_angle_group(segment.strip())
    if not cleaned:
      continue
    context_msg_id = _normalize_context_msg_id(cleaned)
    if not context_msg_id:
      continue
    if allowed_context_ids and context_msg_id not in allowed_context_ids:
      continue
    if context_msg_id in seen:
      continue
    seen.add(context_msg_id)
    result.append(context_msg_id)
  return result


def _extract_actions(
  msg,
  *,
  fallback_reply_to: str | None,
  allowed_context_ids: set[str],
) -> list[dict]:
  text = _extract_reply_text(msg)
  if not text:
    return []
  if _contains_tool_call_xml(text):
    parsed = _extract_tool_call_from_xml(text)
    if parsed:
      logger.info("parsed leaked tool_call XML into %d action(s)", len(parsed))
      return parsed
    logger.warning("failed to parse leaked tool_call XML; dropping")
    return []

  actions: list[dict] = []
  orphan_lines: list[str] = []
  reply_declared = False
  reply_target = fallback_reply_to
  reply_lines: list[str] = []
  react_declared = False
  react_context_ids: list[str] = []
  sticker_declared = False
  sticker_reply_to: str | None = None

  def flush_reply_block() -> None:
    nonlocal reply_declared, reply_target, reply_lines
    if not reply_declared:
      return
    body_text = "\n".join(reply_lines).strip()
    if body_text:
      actions.append(
        {
          "type": "send_message",
          "text": body_text,
          "replyTo": reply_target,
        }
      )
    reply_declared = False
    reply_target = fallback_reply_to
    reply_lines = []

  def flush_react_block() -> None:
    nonlocal react_declared, react_context_ids
    if not react_declared:
      return
    react_declared = False
    react_context_ids = []

  def flush_sticker_block() -> None:
    nonlocal sticker_declared, sticker_reply_to
    if not sticker_declared:
      return
    sticker_declared = False
    sticker_reply_to = None

  lines = text.splitlines()
  for raw_line in lines:
    stripped = raw_line.strip()
    marker = ACTION_LINE_RE.match(stripped)
    if not marker:
      if sticker_declared and stripped:
        actions.append(
          {
            "type": "send_sticker",
            "stickerName": stripped,
            "replyTo": sticker_reply_to,
          }
        )
        flush_sticker_block()
      elif react_declared and stripped:
        emoji = stripped
        for ctx_id in react_context_ids:
          actions.append(
            {
              "type": "react_message",
              "contextMsgId": ctx_id,
              "emoji": emoji,
            }
          )
        flush_react_block()
      elif reply_declared:
        reply_lines.append(raw_line)
      else:
        orphan_lines.append(raw_line)
      continue

    control = marker.group(1).upper()
    value = marker.group(2).strip()

    flush_react_block()

    if control == "REPLY_TO":
      flush_reply_block()
      reply_declared = True
      reply_target = _resolve_reply_target(
        value,
        fallback_reply_to=fallback_reply_to,
        allowed_context_ids=allowed_context_ids,
      )
      continue

    if control == "REACT_TO":
      flush_reply_block()
      flush_sticker_block()
      ctx_ids = _parse_react_context_ids(
        value,
        allowed_context_ids=allowed_context_ids,
      )
      if ctx_ids:
        react_declared = True
        react_context_ids = ctx_ids
      continue

    if control == "STICKER":
      flush_reply_block()
      flush_react_block()
      sticker_declared = True
      sticker_reply_to = _resolve_reply_target(
        value,
        fallback_reply_to=fallback_reply_to,
        allowed_context_ids=allowed_context_ids,
      )

  flush_reply_block()
  flush_react_block()
  flush_sticker_block()

  orphan_text = "\n".join(orphan_lines).strip()
  if orphan_text and not actions:
    actions.append({
      "type": "send_message",
      "text": orphan_text,
      "replyTo": fallback_reply_to,
    })
  elif orphan_text:
    logger.info(
      "dropping llm2 text outside REPLY_TO block",
      extra={
        "text_preview": _normalize_preview_text(orphan_text, limit=180),
        "fallback_reply_to": fallback_reply_to,
      },
    )

  return actions


_MEMORY_DELETE_RE = re.compile(
  r"^/(?:memory|memo|mem)\b"
  r"(\s+(?:global|default))?"
  r"\s+(?:delete|del|remove|rm)\b"
  r"\s+(.+)$",
  re.IGNORECASE,
)
_MEMORY_ADD_RE = re.compile(
  r"^/(?:memory|memo|mem)\b"
  r"(\s+(?:global|default))?"
  r"\s+add\b"
  r"\s+(.+)$",
  re.IGNORECASE,
)


def _coalesce_memory_commands(actions: list[dict]) -> list[dict]:
  run_cmds = [a for a in actions if a.get("type") == "run_command"]
  non_run = [a for a in actions if a.get("type") != "run_command"]

  if not run_cmds:
    return actions

  delete_by_scope: dict[str, list[tuple[int, str]]] = {}
  add_by_scope: dict[str, list[dict]] = {}
  non_memory: list[dict] = []

  for action in run_cmds:
    cmd = action.get("command", "")
    m_del = _MEMORY_DELETE_RE.match(cmd)
    if m_del:
      scope = (m_del.group(1) or "").strip().lower()
      raw_indices = m_del.group(2) or ""
      for token in raw_indices.split(","):
        token = token.strip()
        if token.isdigit() and int(token) > 0:
          delete_by_scope.setdefault(scope, []).append(
            (int(token), action.get("contextMsgId")),
          )
      continue

    m_add = _MEMORY_ADD_RE.match(cmd)
    if m_add:
      scope = (m_add.group(1) or "").strip().lower()
      add_by_scope.setdefault(scope, []).append(action)
      continue

    non_memory.append(action)

  has_deletes = any(v for v in delete_by_scope.values())
  has_adds = any(v for v in add_by_scope.values())
  if not has_deletes and not has_adds:
    return actions

  result: list[dict] = []
  for scope in sorted(set(list(delete_by_scope) + list(add_by_scope))):
    entries = delete_by_scope.get(scope, [])
    if entries:
      seen_idx: set[int] = set()
      unique: list[int] = []
      anchor_first: str | None = None
      for idx, anc in entries:
        if idx in seen_idx:
          continue
        seen_idx.add(idx)
        unique.append(idx)
        if anchor_first is None:
          anchor_first = anc
      merged = "/memory"
      if scope:
        merged += " " + scope.lstrip()
      merged += " delete " + ",".join(str(i) for i in sorted(unique))
      result.append({
        "type": "run_command",
        "command": merged,
        "contextMsgId": anchor_first,
      })
    result.extend(add_by_scope.get(scope, []))

  if has_deletes:
    logger.info(
      "coalesced memory commands: %d delete indices across %d scope(s)",
      sum(len(v) for v in delete_by_scope.values()),
      len(delete_by_scope),
    )

  return non_run + result + non_memory


def _extract_actions_from_tool_calls(
  tool_calls: list,
  *,
  fallback_reply_to: str | None,
  allowed_context_ids: set[str],
) -> list[dict]:
  if not tool_calls:
    return []

  allowed_context_ids = set(allowed_context_ids or ())
  actions: list[dict] = []

  for tc in tool_calls:
    name = get_tool_call_name(tc)
    if not name:
      continue
    args = extract_tool_args(tc)

    for key, value in list(args.items()):
      if isinstance(value, str) and _contains_tool_call_xml(value):
        logger.warning("dropping leaked tool_call XML in arg %s", key)
        args[key] = ""

    if name == "reply_message":
      text = str(args.get("text") or "").strip()
      if not text:
        continue
      reply_to = _resolve_reply_target(
        args.get("context_msg_id"),
        fallback_reply_to=fallback_reply_to,
        allowed_context_ids=allowed_context_ids,
      )
      actions.append({
        "type": "send_message",
        "text": text,
        "replyTo": reply_to,
      })

      raw_command = args.get("command")
      command_texts: list[str] = []
      if isinstance(raw_command, list):
        for c in raw_command:
          if c and isinstance(c, str):
            t = c.strip()
            if t.lower() in {"null", "none", "nil", "/"}:
              continue
            if t:
              command_texts.append(t)
      elif raw_command:
        t = str(raw_command).strip()
        if t.lower() not in {"null", "none", "nil", "/"} and t:
          command_texts.append(t)

      if command_texts:
        raw_command_ctx = args.get("command_context_msg_id")
        ctx_ids: list[str | None]
        if isinstance(raw_command_ctx, list):
          ctx_ids = list(raw_command_ctx)
        elif isinstance(raw_command_ctx, str) and raw_command_ctx.strip():
          ctx_ids = [raw_command_ctx] * len(command_texts)
        else:
          ctx_ids = [None] * len(command_texts)

        while len(ctx_ids) < len(command_texts):
          ctx_ids.append(None)

        for i, command_text in enumerate(command_texts):
          if not command_text.startswith("/"):
            command_text = "/" + command_text
          anchor = ctx_ids[i]
          if anchor is None or not anchor.strip():
            resolved_anchor = reply_to
          else:
            resolved_anchor = _resolve_reply_target(
              anchor,
              fallback_reply_to=reply_to,
              allowed_context_ids=allowed_context_ids,
            )
          actions.append({
            "type": "run_command",
            "command": command_text,
            "contextMsgId": resolved_anchor,
          })

    elif name == "react_to_message":
      emoji = str(args.get("emoji") or "").strip()
      ctx_id = _normalize_context_msg_id(args.get("context_msg_id"))
      if not emoji or not ctx_id:
        continue
      if allowed_context_ids and ctx_id not in allowed_context_ids:
        logger.warning("react target ignored: context id %s not in allowed set", ctx_id)
        continue
      actions.append({
        "type": "react_message",
        "contextMsgId": ctx_id,
        "emoji": emoji,
      })

    elif name == "send_sticker":
      sticker_name = str(args.get("sticker_name") or "").strip()
      ctx_id = _normalize_context_msg_id(args.get("context_msg_id"))
      if not sticker_name or not ctx_id:
        continue
      if allowed_context_ids and ctx_id not in allowed_context_ids:
        logger.warning("sticker target ignored: context id %s not in allowed set", ctx_id)
        continue
      reply_to = _resolve_reply_target(
        args.get("context_msg_id"),
        fallback_reply_to=fallback_reply_to,
        allowed_context_ids=allowed_context_ids,
      )
      actions.append({
        "type": "send_sticker",
        "stickerName": sticker_name,
        "replyTo": reply_to,
      })

    elif name == "send_quiz":
      question = str(args.get("question") or "").strip()
      if not question:
        continue
      raw_choices = args.get("choices") or []
      if not isinstance(raw_choices, list) or len(raw_choices) < 2:
        continue
      choices = []
      for ch in raw_choices:
        if not isinstance(ch, dict):
          continue
        label = str(ch.get("label") or "").strip()
        text = str(ch.get("text") or "").strip()
        if not label or not text:
          continue
        label = re.sub(r'[^A-Za-z]', '', label)
        if label:
          label = label[0].upper()
        if not label:
          continue
        text = re.sub(r'^[\s:;,.\-]+', '', text)
        if not text:
          continue
        text = text[:20]
        choices.append({"label": label, "text": text})
      if len(choices) < 2:
        continue
      reply_to = _resolve_reply_target(
        args.get("context_msg_id"),
        fallback_reply_to=fallback_reply_to,
        allowed_context_ids=allowed_context_ids,
      )
      footer = args.get("footer")
      footer = str(footer).strip() if footer else None
      actions.append({
        "type": "send_quiz",
        "question": question,
        "choices": choices,
        "replyTo": reply_to,
        "footer": footer,
      })

    elif name == "execute_subtask":
      instruction = str(args.get("instruction") or "").strip()
      confirmation_text = str(args.get("confirmation_text") or "").strip()
      high_quality = bool(args.get("high_quality", False))
      if not instruction:
        continue

      ctx_ids = args.get("context_msg_ids") or []
      if isinstance(ctx_ids, str):
        ctx_ids = [ctx_ids]

      valid_ids: list[str] = []
      seen_ids: set[str] = set()
      invalid_ids: list[str] = []
      for raw in ctx_ids:
        if raw is None or (isinstance(raw, str) and _is_empty_target_token(raw)):
          continue
        cid = _normalize_context_msg_id(raw)
        if not cid or not cid.isdigit() or len(cid) != 6:
          invalid_ids.append(str(raw))
          continue
        if cid not in allowed_context_ids:
          invalid_ids.append(cid)
          continue
        if cid in seen_ids:
          continue
        seen_ids.add(cid)
        valid_ids.append(cid)

      if invalid_ids:
        logger.warning("execute_subtask ignored: invalid or unavailable context ids=%s", invalid_ids)
        continue

      if confirmation_text:
        conf_reply_to = valid_ids[-1] if valid_ids else fallback_reply_to
        actions.append({
          "type": "send_message",
          "text": confirmation_text,
          "replyTo": conf_reply_to,
        })

      actions.append({
        "type": "execute_subtask",
        "instruction": instruction,
        "contextMsgIds": valid_ids,
        "high_quality": high_quality,
      })

    else:
      logger.warning("unknown LLM2 tool call: %s", name)

  return _coalesce_memory_commands(actions)