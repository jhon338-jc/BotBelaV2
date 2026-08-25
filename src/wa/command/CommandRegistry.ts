// ---------------------------------------------------------------------------
// Registry command + dispatch
// ---------------------------------------------------------------------------
// Single source of truth buat slash command Node. Setiap command adalah
// `CommandHandler` descriptor yang deklarasi nama kanonik, alias, dan izin.
// Registry bangun `Map<token, handler>` dari descriptor (nama + alias),
// jadi nambah command = nambah satu file handler, ga perlu tabel alias manual.

import { unwrapMessage, extractContextInfo } from "../domain/messageParser.js";
import config from "../../config.js";
import { parseRawSlash } from "../commands/parseCommand.js";
import { isActivationRequired, isChatEnabled } from "../botConfig.js";
import type { proto, WAMessage } from "baileys";
import type { ParticipantRoleFlags, GroupContextValue } from "../domain/caches.js";
import type { AccountContext } from "../../account/accountContext.js";
import type { AccountRepositories } from "../../db/repositories/index.js";
import type { CommandContext, CommandHandler } from "./CommandContext.js";
import type { WaSocketLike } from "../../protocol/ports.js";
import {
  resolveAtom,
  isPermitted as isPermittedBy,
  validatePermission,
  describePermission,
} from "./permission.js";

import { readdirSync } from "fs";
import { join } from "path";
import { fileURLToPath, pathToFileURL } from "url";

let commandRegistry: Map<string, CommandHandler> = new Map();

function isCommandHandler(val: unknown): val is CommandHandler {
  const v = val as Record<string, unknown>;
  return (
    typeof val === "object" &&
    val !== null &&
    Array.isArray(v.commands) &&
    v.commands.length > 0 &&
    v.commands.every((t) => typeof t === "string") &&
    typeof v.run === "function"
  );
}

function resolvePermissionAtom(
  name: string,
  context: CommandListenerContext,
): boolean {
  return resolveAtom(name, {
    isOwner: Boolean(context.senderIsOwner),
    isAdmin: Boolean(context.senderIsAdmin),
    isGroup: context.chatType === "group",
    isPrivate: context.chatType !== "group",
    fromMe: Boolean(context.fromMe),
  });
}

function isPermitted(
  permission: string,
  context: CommandListenerContext,
): boolean {
  return isPermittedBy(permission, (name) =>
    resolvePermissionAtom(name, context),
  );
}

async function initCommandRegistry(): Promise<void> {
  const commandDir = fileURLToPath(new URL("../commands/", import.meta.url));
  const files = readdirSync(commandDir).filter(
    (f) => f.endsWith(".ts") && f !== "index.ts" && f !== "parseCommand.ts",
  );
  const handlers: CommandHandler[] = [];
  for (const file of files) {
    const fileUrl = pathToFileURL(join(commandDir, file)).href;
    const mod = await import(fileUrl);
    for (const val of Object.values(mod)) {
      if (isCommandHandler(val)) handlers.push(val);
    }
  }
  const map = new Map<string, CommandHandler>();
  for (const handler of handlers) {
    const canonical = handler.commands[0];
    validatePermission(handler.permission, canonical);
    for (const token of handler.commands) {
      if (map.has(token)) {
        throw new Error(`Duplicate command token registered: ${token}`);
      }
      map.set(token, handler);
    }
  }
  commandRegistry = map;
}

function getCommand(token: string): CommandHandler | undefined {
  return commandRegistry.get(token);
}

function listCommands(): CommandHandler[] {
  return [...new Set(commandRegistry.values())];
}

function parseSlashCommand(
  text: string | null,
): { command: string; args: string } | null {
  const raw = parseRawSlash(text);
  if (!raw) return null;
  const handler = getCommand(raw.command);
  if (!handler) return null;
  return { command: handler.commands[0], args: raw.args };
}

type ListenerMessage = {
  key: proto.IMessageKey;
  message?: proto.IMessage | Record<string, unknown> | null;
  pushName?: string | null;
  quotedStanzaId?: string | null;
};

export interface CommandListenerContext {
  slashCommand: { command: string; args: string } | null;
  chatId: string;
  chatType: string;
  senderId: string;
  senderIsAdmin: boolean;
  senderIsOwner: boolean;
  botIsAdmin: boolean;
  botIsSuperAdmin?: boolean;
  contextMsgId?: string | null;
  fromMe?: boolean;
  text?: string;
  senderDisplay?: string;
  senderRole?: ParticipantRoleFlags | null;
  group?: GroupContextValue | null;
  account?: AccountContext;
  folderPath?: string;
  repos?: AccountRepositories;
  sock?: WaSocketLike;
}

const ACTIVATION_EXEMPT_COMMANDS = new Set(["info", "activate"]);
const ACTIVATION_EXEMPT_COMMANDS_DM = new Set(["activate"]);

async function dispatchCommand(
  msg: ListenerMessage,
  context: CommandListenerContext,
): Promise<boolean> {
  const {
    slashCommand,
    chatId,
    chatType,
    senderIsAdmin,
    senderId,
    botIsAdmin,
    senderIsOwner,
    contextMsgId,
    fromMe,
  } = context;

  if (!slashCommand) return false;

  const { command, args } = slashCommand;

    const handler = getCommand(command);
  if (!handler) return false;

  const folderPath =
    context.folderPath ?? context.account?.folderPath ?? config.dataDir;

  const repos = context.repos ?? context.account?.repos;

  // Gate: bot must be enabled per chat
  const enabled = isChatEnabled(repos, chatId);
  if (!enabled && command !== "boton") {
    return true;
  }

  if (isActivationRequired(repos)) {
    const exempt = chatType === 'private' ? ACTIVATION_EXEMPT_COMMANDS_DM : ACTIVATION_EXEMPT_COMMANDS;
    if (!exempt.has(command) && !senderIsOwner) {
      const activated = repos!.activation.isChatActivated(chatId);
      if (!activated) {
        if (chatType !== 'private') {
          const notified = repos!.activation.isExpiryNotified(chatId);
          if (!notified) {
            const sock = context.sock;
            const activation = repos!.activation.getChatActivation(chatId);
            if (activation && activation.expiresAt) {
              const now = new Date();
              const expiry = new Date(activation.expiresAt);
              if (expiry <= now) {
                try {
                  await sock!.sendMessage(chatId, {
                    text: `Aktivasi expired ${expiry.toLocaleDateString('id-ID')}. Pakai /activate <kode> buat perpanjang.`,
                  });
                } catch (err) { /* ignore */ }
                repos!.activation.markExpiryNotified(chatId);
              }
            }
          }
        }
        return true;
      }
    }
  }

  if (!isPermitted(handler.permission, context)) {
    try {
      await context.sock!.sendMessage(chatId, {
        text: `Command ini cuma buat ${describePermission(handler.permission)}. ❌`,
      });
    } catch (e) { /* ignore */ }
    return true;
  }

  const { message: innerMessage } = unwrapMessage(
    msg.message as proto.IMessage | null | undefined,
  );
  const quotedMessageId =
    innerMessage?.extendedTextMessage?.contextInfo?.stanzaId ||
    extractContextInfo(innerMessage)?.stanzaId ||
    null;

  const ctx: CommandContext = {
    chatId,
    chatType,
    senderId,
    senderIsAdmin,
    senderIsOwner,
    botIsAdmin,
    args,
    text: args,
    contextMsgId: contextMsgId ?? null,
    quotedMessageId,
    senderDisplay: context.senderDisplay ?? "",
    senderRole: context.senderRole ?? null,
    isGroup: chatType === "group",
    fromMe: Boolean(fromMe),
    group: context.group ?? null,
    msg: msg as unknown as WAMessage,
    account: context.account,
    folderPath,
    sock: context.sock!,
    repos,
  };

  await handler.run(ctx.sock, ctx.msg, ctx);
  return true;
}

export { getCommand, listCommands, parseSlashCommand, dispatchCommand, commandRegistry, initCommandRegistry };