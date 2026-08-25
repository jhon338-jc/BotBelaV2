/**
 * /addsticker <name> — Tambahkan stiker ke katalog bot untuk chat ini.
 *
 * Penggunaan:
 *   - Kirim stiker WhatsApp dengan caption `/addsticker <name>`
 *   - Atau reply ke stiker yang sudah ada dengan `/addsticker <name>`
 *
 * Izin:
 *   - Grup : admin grup atau owner bot saja
 *   - Private: siapa saja (pengecualian — chat pribadi = owner langsung)
 *
 * Nama stiker:
 *   - Huruf kecil, angka, underscore (_), minus (-), panjang 1–64 karakter
 *   - Contoh: "smile", "thumbs_up", "no-way"
 *
 * Stiker yang ditambahkan disimpan di DB terpisah (stickers.db) dan tersedia
 * HANYA untuk chat yang menambahkannya (isolasi per-chat).
 *
 * Stiker Lottie/premium:
 *   Untuk stiker premium WhatsApp (lottieStickerMessage, mime: application/was),
 *   alih-alih mengunduh dan menyimpan file .webp (yang kehilangan animasi),
 *   kami menyimpan payload JSON asli dari lottieStickerMessage. Ketika bot
 *   mengirim balik stiker ini, payload itu diteruskan apa adanya via Baileys
 *   relayMessage agar animasi Lottie tetap terjaga.
 */

import path from "path";
import fs from "fs-extra";
import { randomUUID } from "crypto";
import logger from "../../logger.js";
import { unwrapMessage } from "../domain/messageParser.js";
import { downloadMediaToFile } from "../../mediaHandler.js";
import config from "../../config.js";
import { withTimeout } from "../utils.js";
import type { proto, DownloadableMessage } from "baileys";
import {
  STICKER_NAME_RE,
  parseStickerScope,
  upsertWebpSticker,
  upsertLottieSticker,
} from "./stickerStore.js";
import type {
  CommandContext,
  CommandHandler,
} from "../command/CommandContext.js";

// ---------------------------------------------------------------------------
// Deteksi tipe stiker
// ---------------------------------------------------------------------------

/**
 * Mengembalikan true jika objek pesan dalam adalah stiker Lottie/premium.
 * Stiker Lottie dibungkus sebagai lottieStickerMessage, atau
 * stickerMessage dalamnya punya isLottie=true atau mimetype="application/was".
 */
function isLottieSticker(msgObj: proto.IMessage | null | undefined): boolean {
  if (!msgObj) return false;
  if (msgObj.lottieStickerMessage) return true;
  const sc = msgObj.stickerMessage;
  if (sc && (sc.isLottie === true || sc.mimetype === "application/was"))
    return true;
  return false;
}

/**
 * Serialisasi payload stiker Lottie ke JSON untuk disimpan.
 * Kami menyimpan objek wrapper lottieStickerMessage (atau yang disintesis
 * jika stikernya datang sebagai stickerMessage biasa dengan isLottie=true).
 */
function serializeLottiePayload(msgObj: proto.IMessage | null | undefined, stickerContent: proto.Message.IStickerMessage | null | undefined): string {
  if (msgObj?.lottieStickerMessage) {
    // Pilihan utama: simpan wrapper lottieStickerMessage lengkap apa adanya.
    // Saat meneruskan, kami bungkus kembali dalam { lottieStickerMessage: ... }.
    return JSON.stringify(msgObj.lottieStickerMessage);
  }
  // Fallback: bungkus stickerMessage dalam lottieStickerMessage sintetis.
  return JSON.stringify({ message: { stickerMessage: stickerContent } });
}

// ---------------------------------------------------------------------------
// Helper file stiker (untuk stiker WebP biasa / animasi)
// ---------------------------------------------------------------------------

/**
 * Unduh stiker dari pesan WhatsApp ke file sementara.
 * Mengembalikan path file sementara, atau null jika gagal.
 */
async function downloadStickerToTemp(
  stickerContent: DownloadableMessage,
  messageId: string,
  mediaDir: string = config.mediaDir,
): Promise<string | null> {
  if (!stickerContent) return null;
  try {
    await fs.ensureDir(mediaDir);
    const tempPath = path.join(mediaDir, `addsticker_tmp_${messageId}.webp`);

    try {
      await downloadMediaToFile(
        stickerContent,
        "sticker",
        tempPath,
        withTimeout,
      );
    } catch (firstErr: unknown) {
      const theErr = firstErr as Record<string, unknown> | null | undefined;
      const msg = String(theErr?.message || "").toLowerCase();
      const isDecryptError =
        msg.includes("bad decrypt") ||
        msg.includes("unable to authenticate") ||
        msg.includes("wrong final block") ||
        msg.includes("mac check failed") ||
        msg.includes("failed to decrypt");
      if (!isDecryptError) throw firstErr;
      logger.warn(
        { err: firstErr, messageId },
        "addsticker: dekripsi stiker gagal, mencoba ulang sebagai gambar",
      );
      await fs.remove(tempPath).catch(() => {});
      await downloadMediaToFile(stickerContent, "image", tempPath, withTimeout);
    }

    return tempPath;
  } catch (err) {
    logger.warn(
      { err, messageId },
      "addsticker: gagal mengunduh media stiker",
    );
    return null;
  }
}

/**
 * Simpan file stiker ke direktori upload.
 * Mengembalikan path permanen.
 */
async function persistStickerFile(
  tempPath: string,
  chatId: string,
  name: string,
  uploadDir: string = config.stickerUploadDir,
): Promise<string> {
  await fs.ensureDir(uploadDir);
  const { createHash } = await import("crypto");
  const chatHash = createHash("md5").update(chatId).digest("hex").slice(0, 8);
  const destFilename = `${chatHash}_${name}.webp`;
  const destPath = path.join(uploadDir, destFilename);
  await fs.copy(tempPath, destPath, { overwrite: true });
  return destPath;
}

// ---------------------------------------------------------------------------
// Handler command
// ---------------------------------------------------------------------------

async function handleAddSticker({
  chatId,
  senderIsOwner,
  senderId,
  args,
  msg,
  sock,
  account,
  folderPath,
}: CommandContext): Promise<void> {
  // Per-tenant media / direktori upload stiker (CONTRACT.md §8): file sementara
  // dan stiker katalog yang dipersisten harus berada di folder akun INI
  // agar allowlist outbound (kini per-tenant) menerima path yang nanti
  // dirujuk LLM lewat send_sticker.
  const mediaDir = account?.mediaDir ?? config.mediaDir;
  const uploadDir = account?.stickerUploadDir ?? config.stickerUploadDir;

  async function reply(text: string): Promise<void> {
    try {
      await sock.sendMessage(chatId, { text });
    } catch (err) {
      logger.warn({ err, chatId }, "addsticker: gagal mengirim balasan");
    }
  }

  // ------------------------------------------------------------------
  // 1. Parse scope (`global` | `default` → katalog bersama; selain itu per-chat)
  // ------------------------------------------------------------------
  const { isShared, targetChatId, name: nameArg, label: scopeLabel } =
    parseStickerScope(args, chatId);

  // ------------------------------------------------------------------
  // 2. Cek izin
  // ------------------------------------------------------------------
  if (isShared && !senderIsOwner) {
    await reply("Hanya owner bot yang bisa menambah stiker bersama. ❌");
    return;
  }

  // ------------------------------------------------------------------
  // 3. Parse & validasi nama stiker
  // ------------------------------------------------------------------
  const rawName = nameArg.toLowerCase();
  if (!rawName) {
    await reply(
      "Cara pakai: `/add-sticker <nama>`\n" +
        "Kirim/reply ke stiker dengan caption itu.\n\n" +
        "Nama harus huruf kecil, angka, underscore atau minus (maks 64 karakter).\n" +
        "Contoh: `/add-sticker smile`\n\n" +
        "_Khusus owner:_ `/add-sticker default <nama>` (atau `global`) — tambah ke katalog bersama (semua chat).",
    );
    return;
  }

  if (!STICKER_NAME_RE.test(rawName)) {
    await reply(
      `Nama stiker tidak valid: *${rawName}*\n` +
        "Pakai huruf kecil, angka, underscore (_) atau minus (-), 1–64 karakter.",
    );
    return;
  }

  // ------------------------------------------------------------------
  // 4. Cari stiker di pesan atau pesan yang di-quote
  //
  //    Format stiker WhatsApp:
  //    a) WebP biasa / animasi:  message.stickerMessage
  //    b) Stiker Lottie premium :  message.lottieStickerMessage.message.stickerMessage
  //       (wrapper luar punya mimetype "application/was")
  //
  //    Untuk Lottie: kami simpan JSON payload, BUKAN file yang diunduh.
  //    Untuk reguler: kami unduh dan simpan file .webp.
  // ------------------------------------------------------------------
  const { message: innerMessage } = unwrapMessage(msg!.message) || {};
  let stickerContent: proto.Message.IStickerMessage | null = null;
  let sourceMsgObj: proto.IMessage | null = null;
  let messageIdForFile: string = msg!.key?.id || randomUUID();

  /**
   * Ekstrak konten stickerMessage + msgObj sumber dari wrapper apa pun.
   */
  function extractSticker(msgObj: proto.IMessage | null | undefined): { content: proto.Message.IStickerMessage; msgObj: proto.IMessage } | null {
    if (!msgObj) return null;
    if (msgObj.stickerMessage)
      return { content: msgObj.stickerMessage, msgObj };
    const lottie = msgObj.lottieStickerMessage;
    if (lottie?.message?.stickerMessage) {
      return { content: lottie.message.stickerMessage, msgObj };
    }
    return null;
  }

  // Pesan saat ini
  if (innerMessage) {
    const extracted = extractSticker(innerMessage);
    if (extracted) {
      stickerContent = extracted.content;
      sourceMsgObj = extracted.msgObj;
    }
  }

  // Fallback ke pesan yang di-quote
  if (!stickerContent) {
    const ctx =
      innerMessage?.extendedTextMessage?.contextInfo ||
      innerMessage?.stickerMessage?.contextInfo ||
      innerMessage?.lottieStickerMessage?.message?.stickerMessage
        ?.contextInfo ||
      null;
    if (ctx?.quotedMessage) {
      const { message: qMsg } = unwrapMessage(ctx.quotedMessage) || {};
      const extracted = extractSticker(qMsg || ctx.quotedMessage);
      if (extracted) {
        stickerContent = extracted.content;
        sourceMsgObj = extracted.msgObj;
        messageIdForFile = ctx.stanzaId || messageIdForFile;
      }
    }
  }

  if (!stickerContent) {
    await reply(
      "Stiker tidak ditemukan.\n" +
        "Kirim stiker dengan caption `/addsticker <nama>`, atau reply ke stiker dengan command itu.",
    );
    return;
  }

  // ------------------------------------------------------------------
  // 5. Simpan — Lottie: simpan JSON payload; reguler: unduh file
  // ------------------------------------------------------------------
  const lottie = isLottieSticker(sourceMsgObj);

  if (lottie) {
    // --- Jalur Lottie: serialisasi payload JSON, tanpa unduh file ---
    try {
      const lottiePayloadJson = serializeLottiePayload(
        sourceMsgObj,
        stickerContent,
      );
      const action = upsertLottieSticker(
        folderPath,
        targetChatId,
        rawName,
        lottiePayloadJson,
        senderId || "",
      );

      logger.info(
        {
          chatId,
          targetChatId,
          name: rawName,
          senderId,
          action,
          type: "lottie",
          isShared,
        },
        "addsticker: stiker lottie terdaftar (payload tersimpan, tanpa unduh file)",
      );

      if (action === "updated") {
        await reply(
          `Stiker Lottie${scopeLabel} *${rawName}* berhasil diperbarui! ✨✅`,
        );
      } else {
        await reply(
          `Stiker Lottie${scopeLabel} *${rawName}* berhasil ditambahkan! ✨✅\n` +
            "Bot bisa menggunakan stiker animasi ini sepenuhnya.",
        );
      }
    } catch (err: unknown) {
      logger.error(
        { err, chatId, name: rawName },
        "addsticker: penyimpanan lottie gagal",
      );
      await reply(`Gagal menyimpan stiker Lottie: ${err instanceof Error ? err.message : String(err)} ❌`);
    }
    return;
  }

  // --- Jalur WebP reguler / animasi: unduh file ---
  let tempPath: string | null = null;
  try {
    tempPath = await downloadStickerToTemp(
      stickerContent,
      messageIdForFile,
      mediaDir,
    );
    if (!tempPath) {
      await reply("Gagal mengunduh stiker. Coba lagi nanti. ❌");
      return;
    }

    const destPath = await persistStickerFile(
      tempPath,
      targetChatId,
      rawName,
      uploadDir,
    );
    const action = upsertWebpSticker(
      folderPath,
      targetChatId,
      rawName,
      destPath,
      senderId || "",
    );

    logger.info(
      {
        chatId,
        targetChatId,
        name: rawName,
        senderId,
        action,
        type: "webp",
        isShared,
      },
      "addsticker: stiker webp terdaftar",
    );

    if (action === "updated") {
      await reply(
        `Stiker${scopeLabel} *${rawName}* berhasil diperbarui! ✅`,
      );
    } else {
      await reply(
        `Stiker${scopeLabel} *${rawName}* berhasil ditambahkan! ✅\nBot sekarang bisa menggunakan stiker ini.`,
      );
    }
  } catch (err: unknown) {
    logger.error({ err, chatId, name: rawName }, "addsticker: gagal");
    await reply(`Gagal menyimpan stiker: ${err instanceof Error ? err.message : String(err)} ❌`);
  } finally {
    if (tempPath) {
      try {
        await fs.remove(tempPath);
      } catch {
        /* ignore */
      }
    }
  }
}

export { handleAddSticker };

export const addStickerCommand: CommandHandler = {
  commands: ["add-sticker", "addsticker", "addstickers", "add-stickers"],
  description:
    "Tambah stiker ke katalog bot dengan reply ke stiker lalu beri nama. Bot bisa mengirim stiker dari katalog ini pakai tool send_sticker. Pakai /add-sticker default <nama> (atau global) untuk menambah ke katalog bersama semua chat (khusus owner). Contoh: /add-sticker funny_cat.",
  permission: "isPrivate or isAdmin or isOwner",
  run: (_sock, _message, ctx) => handleAddSticker(ctx),
};