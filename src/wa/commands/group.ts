import logger from "../../logger.js";
import * as registry from "../../server/accountRegistry.js";
import type { CommandContext, CommandHandler } from "../command/CommandContext.js";
import { rewritePromptMentions } from "./prompt.js";
import { resolveQuotedMessage } from "../domain/identifiers.js";
import { kickMembers } from "../moderation.js";

const TARGET_RE = /^@(.+?)\s*\(([0-9a-z]{6})\)$/i;
const MUTE_RE = /^@(.+?)\s*\(([0-9a-z]{6})\)\s+(\d+)$/i;
const NUMBER_RE = /^@?(\d[\d\s\-+]*)$/;
const PIN_SECONDS: Record<string, 86400 | 604800 | 2592000> = {
  "1": 86400,
  "7": 604800,
  "30": 2592000,
};

const BOT_PERMISSION_REQUIRED = {
  delete: 1,
  mute: 2,
  kick: 3,
} as const;

const USAGE = [
  "🛠️ *Group management*",
  "",
  "`/group close` — only admins may send messages",
  "`/group open` — all members may send messages",
  "`/group pin <1|7|30>` — reply to the message to pin",
  "`/group delete` — reply to the message to delete",
  "`/group description <text>` — change the group description",
  "`/group kick @mention` — remove a member",
  "`/group mute @mention <minutes>` — mute; use 0 to unmute",
  "`/group add @628xxxx` — add a member by phone number",
].join("\n");

function normalizePhoneNumber(input: string): string | null {
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("0")) {
    digits = `62${digits.slice(1)}`;
  }
  if (!digits || digits.length < 8) return null;
  return digits;
}

async function safeText(ctx: CommandContext, text: string): Promise<void> {
  try {
    await ctx.sock.sendMessage(ctx.chatId, { text });
  } catch (err) {
    logger.warn({ err, chatId: ctx.chatId }, "failed sending /group response");
  }
}

async function canonicalArgs(ctx: CommandContext, raw: string): Promise<string> {
  if (!ctx.account) return raw;
  try {
    return await rewritePromptMentions(ctx.account, ctx.chatId, raw, ctx.msg);
  } catch {
    return raw;
  }
}

function repliedMessage(ctx: CommandContext) {
  if (!ctx.account || !ctx.quotedMessageId) return null;
  return resolveQuotedMessage(ctx.account, ctx.chatId, ctx.quotedMessageId);
}

function botPermissionLevel(ctx: CommandContext): number {
  if (!ctx.fromMe) return 3;
  try {
    const level = Number(ctx.repos?.settings.getPermission(ctx.chatId) ?? 0);
    return Number.isFinite(level) ? Math.max(0, Math.min(3, Math.trunc(level))) : 0;
  } catch {
    return 0;
  }
}

async function requireBotModerationPermission(
  ctx: CommandContext,
  action: keyof typeof BOT_PERMISSION_REQUIRED,
): Promise<boolean> {
  if (!ctx.fromMe) return true;
  const current = botPermissionLevel(ctx);
  const required = BOT_PERMISSION_REQUIRED[action];
  if (current >= required) return true;
  await safeText(
    ctx,
    `Bot permission ${current} cannot ${action}; permission ${required} is required. ❌`,
  );
  return false;
}

export async function handleGroup(ctx: CommandContext): Promise<void> {
  if (!ctx.botIsAdmin) {
    await safeText(ctx, "The bot must be a group admin to use this command. ❌");
    return;
  }

  const raw = (ctx.args || "").trim();
  const splitAt = raw.search(/\s/);
  const sub = (splitAt === -1 ? raw : raw.slice(0, splitAt)).toLowerCase();
  const restRaw = splitAt === -1 ? "" : raw.slice(splitAt + 1).trim();

  try {
    if (sub === "close" || sub === "open") {
      await ctx.sock.groupSettingUpdate(
        ctx.chatId,
        sub === "close" ? "announcement" : "not_announcement",
      );
      return;
    }

    if (sub === "description") {
      if (!restRaw) {
        await safeText(ctx, "Usage: `/group description <text>`");
        return;
      }
      await ctx.sock.groupUpdateDescription(ctx.chatId, restRaw);
      return;
    }

        if (sub === "pin" || sub === "sematkan" || sub === "pinpesan") {
      const target = repliedMessage(ctx);
      
      if (!target?.key) {
        await safeText(ctx, "Reply pesan yang mau di-pin dulu ya! 📌");
        return;
      }
      
      // Cari angka durasi di restRaw
      const durationMatch = restRaw.match(/(\d+)/);
      const pinChoice = durationMatch ? durationMatch[1] : null;
      
      // Konversi: 1=24jam, 2=7hari, 3=30hari
      let seconds: number | null = null;
      if (pinChoice === "1") seconds = 86400;
      else if (pinChoice === "2") seconds = 604800;
      else if (pinChoice === "3") seconds = 2592000;
      
      // Kalo ada angka 7/30 langsung
      if (restRaw.includes("7 hari") || restRaw.includes("minggu")) seconds = 604800;
      else if (restRaw.includes("30 hari") || restRaw.includes("bulan")) seconds = 2592000;
      else if (restRaw.includes("24 jam") || restRaw.includes("1 hari")) seconds = 86400;
      
      if (!seconds) {
        await safeText(ctx, "Pilih durasi: 1 (24 jam), 2 (7 hari), 3 (30 hari). Contoh: /group pin 2");
        return;
      }
      
      await ctx.sock.sendMessage(ctx.chatId, {
        pin: target.key,
        type: 1,
        time: seconds,
      });
      
      const durationLabel = seconds === 86400 ? "24 jam" : seconds === 604800 ? "7 hari" : "30 hari";
      await safeText(ctx, `✅ Pesan berhasil disematkan selama ${durationLabel}!`);
      return;
    }

    if (sub === "delete") {
      if (!await requireBotModerationPermission(ctx, "delete")) return;
      const target = repliedMessage(ctx);
      if (!target?.key) {
        await safeText(ctx, "Reply to the message you want to delete, then use `/group delete`.");
        return;
      }
      await ctx.sock.sendMessage(ctx.chatId, { delete: target.key });
      return;
    }

    if (sub === "kick") {
      if (!await requireBotModerationPermission(ctx, "kick")) return;
      const canonical = await canonicalArgs(ctx, restRaw);
      
      // Format 1: @Nama (senderRef)
      const target = canonical.match(TARGET_RE);
      if (target && ctx.account) {
        const result = await kickMembers(ctx.account, {
          chatId: ctx.chatId,
          targets: [{ senderRef: target[2].toLowerCase() }],
          mode: "all_or_nothing",
        }) as { results?: Array<{ ok?: boolean; detail?: string }> };
        const outcome = result.results?.[0];
        if (!outcome?.ok) {
          logger.warn(
            { chatId: ctx.chatId, senderRef: target[2].toLowerCase(), detail: outcome?.detail },
            "/group kick failed",
          );
        }
        return;
      }
      
      // Format 2: @nomor (08xxx, 62xxx, +62 xxx)
      const numberMatch = canonical.match(NUMBER_RE);
      if (numberMatch) {
        const digits = normalizePhoneNumber(numberMatch[1]);
        if (digits) {
          const jid = `${digits}@s.whatsapp.net`;
          try {
            await ctx.sock.groupParticipantsUpdate(ctx.chatId, [jid], "remove");
            await safeText(ctx, `✅ @${digits} was removed from the group.`);
          } catch (err) {
            logger.warn({ err, chatId: ctx.chatId, jid }, "/group kick failed");
            await safeText(ctx, "Failed to kick member. Make sure the number is valid and the bot has admin rights. ❌");
          }
          return;
        }
      }
      
      await safeText(ctx, "Usage: `/group kick @mention` atau `/group kick @628xxx`");
      return;
    }

    if (sub === "add") {
      const rawInput = restRaw.replace(/^@/, "").trim();
      if (!rawInput) {
        await safeText(ctx, "Usage: `/group add @628xxxx` (bisa juga 08xxxx, 62xxxx, +62 xxx-xxx-xxxx)");
        return;
      }
      
      const digits = normalizePhoneNumber(rawInput);
      if (!digits) {
        await safeText(ctx, "Invalid phone number. Use format: `/group add @6281234567890`");
        return;
      }
      
      const jid = `${digits}@s.whatsapp.net`;
      try {
        await ctx.sock.groupParticipantsUpdate(ctx.chatId, [jid], "add");
        await safeText(ctx, `✅ @${digits} was added to the group.`);
      } catch (err) {
        logger.warn({ err, chatId: ctx.chatId, jid }, "/group add failed");
        await safeText(ctx, "Failed to add member. Make sure the number is valid and the bot has admin rights. ❌");
      }
      return;
    }

    if (sub === "mute") {
      if (!await requireBotModerationPermission(ctx, "mute")) return;
      const canonical = await canonicalArgs(ctx, restRaw);
      const target = canonical.match(MUTE_RE);
      if (!target) {
        await safeText(ctx, "Usage: `/group mute @mention <minutes>`; use 0 to unmute.");
        return;
      }
      const durationMinutes = Number(target[3]);
      if (!Number.isSafeInteger(durationMinutes) || durationMinutes < 0 || durationMinutes > 43200) {
        await safeText(ctx, "Mute duration must be between 0 and 43200 minutes.");
        return;
      }
      registry.sendReliableToClient(ctx.folderPath, {
        type: "set_chat_mute",
        folderPath: ctx.folderPath,
        chatId: ctx.chatId,
        senderRef: target[2].toLowerCase(),
        senderName: target[1].trim() || null,
        durationMinutes,
      });
      await safeText(
        ctx,
        durationMinutes === 0
          ? `🔊 @${target[1]} was unmuted.`
          : `🔇 @${target[1]} was muted for ${durationMinutes} minute(s).`,
      );
      return;
    }
  } catch (err) {
    logger.warn({ err, chatId: ctx.chatId, subcommand: sub }, "/group command failed");
    await safeText(ctx, "Group action failed. Please try again. ❌");
    return;
  }

  await safeText(ctx, USAGE);
}

export const groupCommand: CommandHandler = {
  commands: ["group", "g"],
  description:
    "Manage the current group: close/open, pin/delete a replied message, change description, kick, add, or mute members.",
  permission: "group and (admin or from_me)",
  run: (_sock, _message, ctx) => handleGroup(ctx),
};