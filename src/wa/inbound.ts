/**
 * inbound.js — Transform WhatsApp messages into normalized payloads for the Python bridge.
 */
import logger from '../logger.js';
import config from '../config.js';
import { getDevice } from 'baileys';
import {
  normalizeJid,
  normalizeContextMsgId,
  ensureContextMsgId,
  rememberSenderRef,
  rememberMessage,
} from './domain/identifiers.js';
import {
  rememberParticipantName,
  lookupParticipantName,
  roleFlagsForJid,
  fallbackParticipantLabel,
  compactParticipantJids,
  isOwnerJid,
} from './domain/participants.js';
import {
  getGroupContext,
  normalizeGroupJoinAction,
  invalidateGroupMetadata,
  parseGroupJoinStub,
  getGroupParticipantName,
  currentBotAliases,
} from './domain/groupContext.js';
import {
  unwrapMessage,
  extractMentionedJids,
  extractNonJidMentions,
  extractLocationData,
  formatLocationText,
  extractText,
  extractQuoted,
} from './domain/messageParser.js';
import { buildAttachmentMetadata } from '../mediaHandler.js';
import { escapeRegex } from './utils.js';
import {
  resolveParticipantLabel,
  emitGroupJoinContextEvent,
  emitBotRoleChangeEvent,
  emitBotAddedEvent,
} from './events.js';
import { parseSlashCommand } from './commands/index.js';
import { isActivationRequired, getActivationMessage } from './botConfig.js';
import { sendWelcomeMessage, sendGoodbyeMessage } from './commands/welcome.js';
import type { WAMessage } from 'baileys';
import type { WhatsAppMessagePayload, AccountEntry, Attachment } from '../protocol/types.js';
import type { AccountContext } from '../account/accountContext.js';

const NOT_ACTIVATED_NOTICE_COOLDOWN_MS = 10 * 60 * 1000;
const lastNotActivatedNotice = new Map<string, number>();

function shouldNotifyNotActivated(folderPath: string, chatId: string): boolean {
  const key = `${folderPath}:${chatId}`;
  const now = Date.now();
  const last = lastNotActivatedNotice.get(key) ?? 0;
  if (now - last < NOT_ACTIVATED_NOTICE_COOLDOWN_MS) return false;
  lastNotActivatedNotice.set(key, now);
  if (lastNotActivatedNotice.size > 5000) {
    const cutoff = now - NOT_ACTIVATED_NOTICE_COOLDOWN_MS;
    for (const [k, t] of lastNotActivatedNotice) {
      if (t < cutoff) lastNotActivatedNotice.delete(k);
    }
  }
  return true;
}

interface MentionedParticipant {
  jid: string;
  senderRef: string | null;
  name: string;
  isBot: boolean;
}

async function buildMentionedParticipants(
  ctx: AccountContext,
  chatId: string,
  mentionedJids: unknown,
  botAliasSet: Set<string> | null = null,
): Promise<MentionedParticipant[] | null> {
  if (!Array.isArray(mentionedJids) || mentionedJids.length === 0) return null;
  const normalizedMentions = Array.from(new Set(
    mentionedJids
      .map((jid) => normalizeJid(jid) || jid)
      .filter(Boolean)
  ));
  if (normalizedMentions.length === 0) return null;

  const rows: MentionedParticipant[] = [];
  for (const participantJid of normalizedMentions) {
    const normalized = normalizeJid(participantJid) || participantJid;
    if (!normalized) continue;
    const name = await resolveParticipantLabel(ctx, chatId, normalized);
    const senderRef = rememberSenderRef(ctx, chatId, normalized, normalized) || null;
    const isBot = Boolean(
      botAliasSet instanceof Set
      && (botAliasSet.has(normalized) || botAliasSet.has(participantJid))
    );
    rows.push({
      jid: normalized,
      senderRef,
      name: name || fallbackParticipantLabel(normalized),
      isBot,
    });
  }
  return rows.length > 0 ? rows : null;
}

function checkBotAddedDirect(ctx: AccountContext, participantJids: string[]): boolean {
  const sock = ctx.sock;
  if (!sock?.user?.id) return false;

  const rawParts = sock.user.id.split(':');
  const botBase = rawParts[0];

  if (!botBase) return false;

  for (const participantJid of participantJids) {
    const pBase = participantJid.split(':')[0]?.split('@')[0];
    if (pBase && pBase === botBase) {
      return true;
    }
  }

  const normalizedBot = normalizeJid(sock.user.id);
  if (normalizedBot) {
    return participantJids.some((p) => normalizedBot === p);
  }

  return false;
}

async function handleGroupParticipantsUpdate(ctx: AccountContext, update: {
  id?: string;
  action?: string;
  participants?: unknown[];
  authorPn?: string;
  author?: string;
  authorUsername?: string;
}): Promise<void> {
  const sock = ctx.sock;
  if (!sock) return;
  const chatId = update?.id;
  if (!chatId || !chatId.endsWith('@g.us')) return;

  const rawAction = typeof update?.action === 'string' ? update.action.toLowerCase() : '';
  const participants = compactParticipantJids(Array.isArray(update?.participants) ? update.participants : []);
  if (participants.length === 0) return;
  const actorId = compactParticipantJids([update?.authorPn, update?.author])[0] || null;

  const roleActions = new Set(['promote', 'demote']);
  if (roleActions.has(rawAction)) {
    const botAliases = new Set(currentBotAliases(ctx));
    const botAffected = participants.some((p) => botAliases.has(normalizeJid(p) || p));
    if (botAffected) {
      emitBotRoleChangeEvent(ctx, {
        chatId,
        action: rawAction,
        actorId,
      });
    }
    invalidateGroupMetadata(ctx, chatId);
    return;
  }

  invalidateGroupMetadata(ctx, chatId);
  const action = normalizeGroupJoinAction(rawAction);

  // === CEK AKTIVASI GRUP — WELCOME/GOODBYE CUMA DI GRUP AKTIF ===
  const isActivated = ctx.repos?.activation.isChatActivated(chatId) ?? false;
  if (isActivated) {
    if (action === 'remove' || action === 'leave') {
      for (const participantJid of participants) {
        const normalized = normalizeJid(participantJid) || participantJid;
        const participantName = await resolveParticipantLabel(ctx, chatId, normalized) || fallbackParticipantLabel(normalized);
        await sendGoodbyeMessage(ctx, chatId, participantName);
      }
    } else if (action === 'add' || action === 'invite' || action === 'join' || action === 'approve') {
      for (const participantJid of participants) {
        const normalized = normalizeJid(participantJid) || participantJid;
        const participantName = await resolveParticipantLabel(ctx, chatId, normalized) || fallbackParticipantLabel(normalized);
        await sendWelcomeMessage(ctx, chatId, participantName);
      }
    }
  }

  const joinActions = new Set(['add', 'invite', 'join', 'approve']);
  if (!joinActions.has(action)) return;

  const botAliases = new Set(currentBotAliases(ctx));
  let botBeingAdded = participants.some((p) => botAliases.has(normalizeJid(p) || p));

  if (!botBeingAdded) {
    botBeingAdded = checkBotAddedDirect(ctx, participants);
  }

  if (!botBeingAdded) {
    logger.debug({
      chatId,
      action,
      participants,
      botAliases: [...botAliases],
      userId: sock.user?.id,
      botBase: sock.user?.id?.split(':')[0],
    }, 'bot-join check: did not detect bot in participants');
  }

  if (botBeingAdded) {
    await emitBotAddedEvent(ctx, {
      chatId,
      action,
      participants,
      actorId,
      timestampMs: Date.now(),
      source: 'group-participants.update',
    });
    return;
  }

  await emitGroupJoinContextEvent(ctx, {
    chatId,
    action,
    participants,
    actorId,
    timestampMs: Date.now(),
    source: 'group-participants.update',
  });
}

async function handleIncomingMessage(
  entry: AccountEntry,
  msg: WAMessage,
  { precomputedContextMsgId = null }: { precomputedContextMsgId?: string | null } = {},
): Promise<void> {
  const ctx = entry.ctx;
  const sock = ctx.sock;
  if (!sock) return;
  const perfStartMs = Date.now();
  const perf = {
    groupMs: 0,
    quotedMs: 0,
    mediaMs: 0,
  };

  const stubEvent = parseGroupJoinStub(msg);
  if (stubEvent) {
    const normalizedParticipants = compactParticipantJids(stubEvent.participants);
    const botAliases = new Set(currentBotAliases(ctx));
    let botBeingAdded = normalizedParticipants.some((p) => botAliases.has(normalizeJid(p) || p));

    if (!botBeingAdded) {
      botBeingAdded = checkBotAddedDirect(ctx, normalizedParticipants);
    }

    if (botBeingAdded) {
      await emitBotAddedEvent(ctx, {
        chatId: stubEvent.chatId,
        action: stubEvent.action,
        participants: stubEvent.participants,
        actorId: stubEvent.actorId,
        timestampMs: stubEvent.timestampMs,
        source: 'messages.upsert.stub',
      });
      return;
    }
    await emitGroupJoinContextEvent(ctx, stubEvent);
    return;
  }

  if (!msg.message) return;
  const remoteJid = msg.key.remoteJid;
  if (!remoteJid || remoteJid === 'status@broadcast') return;

  const chatId = remoteJid;
  const isGroup = chatId.endsWith('@g.us');
  const chatType = isGroup ? 'group' : 'private';
  const fromMe = Boolean(msg.key?.fromMe);
  const selfJid = normalizeJid(sock.user?.id) || null;
  const botAliases = new Set(
    currentBotAliases(ctx)
      .map((jid) => normalizeJid(jid) || jid)
      .filter(Boolean)
  );
  if (selfJid) botAliases.add(selfJid);
  const fromId = msg.key.participant || (fromMe ? selfJid : msg.key.remoteJid);
  const senderId = normalizeJid(fromId) || fromId || normalizeJid(msg.key.remoteJid) || msg.key.remoteJid || '';
  const senderDisplay = msg.pushName || lookupParticipantName(ctx, senderId) || senderId;
  rememberParticipantName(ctx, fromId, msg.pushName || '');
  rememberParticipantName(ctx, senderId, senderDisplay);

  const groupStartMs = Date.now();
  const group = isGroup
    ? await getGroupContext(ctx, chatId)
    : null;
  perf.groupMs = Date.now() - groupStartMs;
  const senderRole = isGroup ? roleFlagsForJid(group?.participantRoles, senderId) : { isAdmin: false, isSuperAdmin: false };
  const senderRef = rememberSenderRef(ctx, chatId, senderId, msg.key.participant || senderId) || 'unknown';
  if (
    senderRef !== 'unknown'
    && senderDisplay
    && senderDisplay !== senderId
    && /\p{L}/u.test(senderDisplay)
  ) {
    ctx.repos?.settings.upsertParticipantName(chatId, senderRef, senderDisplay);
  }
  if (!fromMe && msg.key?.id && ctx.repos) {
    const device = getDevice(msg.key.id);
    if (device !== 'unknown') {
      const isAdminOrOwner = senderRole.isAdmin || senderRole.isSuperAdmin || isOwnerJid(senderId, ctx.botOwnerJids);
      if (!isGroup || isAdminOrOwner) {
        ctx.repos.settings.setAutoDevice(chatId, device);
      }
    }
  }
  const contextMsgId = normalizeContextMsgId(precomputedContextMsgId) || ensureContextMsgId(ctx, chatId, msg.key.id!);
  const chatName = isGroup ? (group?.name || chatId) : chatId;
  if (
    !isGroup
    && !fromMe
    && senderDisplay
    && senderDisplay !== senderId
    && senderDisplay !== chatId
  ) {
    ctx.repos?.settings.upsertChatDirectory(chatId, senderDisplay, "private");
  }

  // === ACTIVATION CHECK (dinonaktifkan sementara) ===
  // if (ctx.repos && !fromMe) {
  //   const isOwner = isOwnerJid(senderId, ctx.botOwnerJids);
  //   if (!isOwner) {
  //     const activated = ctx.repos!.activation.isChatActivated(chatId);
  //     if (!activated) {
  //       return;
  //     }
  //   }
  // }

  const { contentType, message: innerMessage } = unwrapMessage(msg.message);
  if (!contentType || !innerMessage) {
    rememberMessage(ctx, msg, {
      chatId,
      contextMsgId,
      senderId,
      senderRef,
      senderIsAdmin: senderRole.isAdmin || senderRole.isSuperAdmin,
      fromMe,
      timestampMs: Number(msg.messageTimestamp) > 0
        ? Number(msg.messageTimestamp) * 1000
        : Date.now(),
    });
    return;
  }
  const content = innerMessage[contentType];
  const location = extractLocationData(innerMessage);
  const locationText = location ? formatLocationText(location) : null;
  const baseText = extractText(innerMessage);
  const text = [baseText, locationText].filter(Boolean).join('\n') || null;
  const quotedStartMs = Date.now();
  const quoted = await extractQuoted(ctx, innerMessage, chatId, {
    allowGroupLookup: !fromMe,
    getGroupParticipantName: (cid, pid) => getGroupParticipantName(ctx, cid, pid),
  });
  perf.quotedMs = Date.now() - quotedStartMs;
  if (quoted && quoted.senderId && isGroup && group) {
    const quotedRole = roleFlagsForJid(group.participantRoles, quoted.senderId);
    (quoted as unknown as Record<string, unknown>).senderIsAdmin = Boolean(quotedRole?.isAdmin);
    (quoted as unknown as Record<string, unknown>).senderIsSuperAdmin = Boolean(quotedRole?.isSuperAdmin);
  }
  let quotedMentionedParticipants: MentionedParticipant[] | null = null;
  if (quoted && Array.isArray(quoted.mentionedJids) && quoted.mentionedJids.length > 0) {
    quotedMentionedParticipants = await buildMentionedParticipants(ctx, chatId, quoted.mentionedJids, botAliases);
  }
  if (quoted) {
    (quoted as unknown as Record<string, unknown>).mentionedParticipants = quotedMentionedParticipants;
  }
  const mentionedJidsRaw = extractMentionedJids(innerMessage);
  const mentionedJids = Array.isArray(mentionedJidsRaw)
    ? Array.from(new Set(
      mentionedJidsRaw
        .map((jid) => normalizeJid(jid) || jid)
        .filter(Boolean)
    ))
    : null;
  const mentionedParticipants = Array.isArray(mentionedJids) && mentionedJids.length > 0
    ? await buildMentionedParticipants(ctx, chatId, mentionedJids, botAliases)
    : null;
  const botMentionedByJid = Boolean(
    Array.isArray(mentionedJids)
    && mentionedJids.some((jid) => botAliases.has(normalizeJid(jid) || jid))
  );
  const botMentionTokens = Array.from(botAliases)
    .map((jid) => String(jid).split('@')[0]?.trim())
    .filter((token) => typeof token === 'string' && token.length >= 5);
  const botMentionedByText = Boolean(
    typeof text === 'string'
    && botMentionTokens.some((token) => (
      new RegExp(`(^|[^0-9A-Za-z_])@${escapeRegex(token)}(?=$|[^0-9A-Za-z_])`).test(text)
    ))
  );
  const botMentioned = botMentionedByJid || botMentionedByText;
  const taggedAll = extractNonJidMentions(innerMessage) >= 1;
  const quotedSenderId = normalizeJid(quoted?.senderId) || quoted?.senderId || null;
  const repliedToBot = Boolean(quotedSenderId && botAliases.has(quotedSenderId));
  if (quoted && repliedToBot) {
    (quoted as unknown as Record<string, unknown>).fromMe = true;
  }
  const isQuizButtonReply = Boolean(
    msg?.message?.templateButtonReplyMessage?.selectedId?.startsWith('qz:')
  );
  const isInteractiveReply = !isQuizButtonReply && repliedToBot && quoted?.type === 'interactiveMessage';
  const isQuizReply = isInteractiveReply && Boolean(quoted?.messageId && ctx.quizMessageIds.has(quoted.messageId));
  const replyToInteractive = isInteractiveReply && !isQuizReply;

  const attachments: unknown[] = [];
  const mediaKinds = [
    'imageMessage',
    'videoMessage',
    'audioMessage',
    'documentMessage',
    'stickerMessage',
  ];
  if (mediaKinds.includes(contentType)) {
    const mediaStartMs = Date.now();
    const meta = buildAttachmentMetadata(contentType, content as Record<string, unknown> | null | undefined, msg.key.id!);
    if (meta) attachments.push(meta);
    perf.mediaMs = Date.now() - mediaStartMs;
  }

  const slashCommand = (typeof text === 'string')
    ? parseSlashCommand(text)
    : null;

  const commandHandled = slashCommand ? true : false;

  const payload: WhatsAppMessagePayload = {
    folderPath: entry.folderPath,
    contextMsgId,
    messageId: msg.key.id!,
    instanceId: config.instanceId,
    chatId,
    chatName,
    chatType,
    senderId,
    senderRef,
    senderName: fromMe ? (senderDisplay || 'LLM') : senderDisplay,
    senderIsAdmin: senderRole.isAdmin || senderRole.isSuperAdmin,
    senderIsSuperAdmin: Boolean(senderRole.isSuperAdmin),
    senderIsOwner: isOwnerJid(senderId, ctx.botOwnerJids),
    isGroup,
    botIsAdmin: Boolean(group?.botIsAdmin),
    botIsSuperAdmin: Boolean(group?.botIsSuperAdmin),
    fromMe,
            contextOnly: false,
    triggerLlm1: false,
    timestampMs: Number(msg.messageTimestamp) * 1000,
    messageType: contentType,
    text,
    quoted: quoted as unknown as WhatsAppMessagePayload['quoted'],
    attachments: attachments as unknown as Attachment[],
    mentionedJids,
    mentionedParticipants: mentionedParticipants as WhatsAppMessagePayload['mentionedParticipants'],
    botMentioned,
    taggedAll,
    repliedToBot,
    location,
    groupDescription: group?.description || null,
    slashCommand: slashCommand || null,
    commandHandled,
  };

  entry.ctx.forwarder!.forwardIncoming(payload);
  rememberMessage(ctx, msg, {
    chatId,
    contextMsgId,
    senderId,
    senderRef,
    senderIsAdmin: payload.senderIsAdmin,
    fromMe,
    timestampMs: payload.timestampMs,
  });

  const totalMs = Date.now() - perfStartMs;
  if (config.perfLogEnabled && totalMs >= config.perfLogThresholdMs) {
    logger.info({
      chatId,
      messageId: msg.key.id,
      messageType: contentType,
      totalMs,
      groupMs: perf.groupMs,
      quotedMs: perf.quotedMs,
      mediaMs: perf.mediaMs,
      attachmentCount: attachments.length,
      isGroup,
      fromMe,
    }, 'slow inbound message processing');
  }
}

export {
  buildMentionedParticipants,
  checkBotAddedDirect,
  handleGroupParticipantsUpdate,
  handleIncomingMessage,
  shouldNotifyNotActivated,
};