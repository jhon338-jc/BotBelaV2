import type { WAMessage } from "baileys";
import logger from "../../logger.js";
import { resolveQuotedMessage } from "../domain/identifiers.js";
import type {
  MessageIndexKey,
} from "../domain/caches.js";
import type {
  CommandContext,
  CommandHandler,
} from "../command/CommandContext.js";

/**
 * Tipe yang dikembalikan dari messageCache.get() atau resolveQuotedMessage().
 * resolveQuotedMessage bisa mengembalikan objek fallback minimal ketika
 * proto penuh sudah tidak ada di cache.
 */
export type CachedMessage = WAMessage | { key: MessageIndexKey; message: { conversation: string } };

async function handleCatch({
  chatId,
  quotedMessageId,
  account,
  sock,
}: CommandContext): Promise<void> {
  if (!quotedMessageId) {
    try {
      await sock.sendMessage(chatId, {
        text: "Reply pesan yang ingin kamu tangkap, lalu ketik `/catch`.",
      });
    } catch (err) {
      logger.warn({ err, chatId }, "gagal mengirim hint penggunaan /catch");
    }
    return;
  }

  let cachedMsg: CachedMessage | null | undefined = account?.messageCache.get(quotedMessageId);
  if (!cachedMsg && account) {
    cachedMsg = resolveQuotedMessage(account, chatId, quotedMessageId);
  }

  if (!cachedMsg || !cachedMsg.message) {
    try {
      await sock.sendMessage(chatId, {
        text: "Pesan tidak ditemukan di cache. Coba reply pesan yang lebih baru.",
      });
    } catch (err) {
      logger.warn(
        { err, chatId, quotedMessageId },
        "gagal mengirim hint /catch tidak ditemukan",
      );
    }
    return;
  }

  const payload = JSON.stringify(cachedMsg, null, 2);

  try {
    await sock.sendMessage(chatId, { text: `\`\`\`json\n${payload}\n\`\`\`` });
  } catch (err) {
    logger.warn(
      { err, chatId, quotedMessageId, length: payload.length },
      "gagal mengirim payload lengkap /catch",
    );
    const truncated =
      payload.length > 6000
        ? `${payload.slice(0, 6000)}\n... (terpotong)`
        : payload;
    try {
      await sock.sendMessage(chatId, {
        text: `\`\`\`json\n${truncated}\n\`\`\``,
      });
    } catch (e) {
      try {
        await sock.sendMessage(chatId, {
          text: "Gagal mengirim payload: terlalu panjang atau terjadi error.",
        });
      } catch (e2) {
        logger.warn({ err: e2, chatId }, "gagal mengirim fallback /catch");
      }
    }
  }
}

export { handleCatch };

export const catchCommand: CommandHandler = {
  commands: ["catch", "catches"],
  description: "Tangkap payload pesan yang di-reply, berguna untuk debugging.",
  permission: "public",
  run: (_sock, _message, ctx) => handleCatch(ctx),
};