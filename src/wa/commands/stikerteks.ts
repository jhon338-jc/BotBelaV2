import sharp from 'sharp';
import path from 'path';
import fs from 'fs-extra';
import { randomUUID } from 'crypto';
import webpmux from 'node-webpmux';
const { Image: WebpImage } = webpmux;
import logger from '../../logger.js';
import config from '../../config.js';
import type { CommandContext, CommandHandler } from '../command/CommandContext.js';

const STICKER_PACK_NAME = config.stickerPackName || 'WazzapStickers';
const STICKER_EMOJI = config.stickerEmoji || '✨';

async function bratToSticker(text: string): Promise<Buffer> {
  const url = `https://api.azbry.com/api/maker/brat?text=${encodeURIComponent(text)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Brat API returned HTTP ${res.status}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  const stickerBuffer = await sharp(buffer)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp()
    .toBuffer();
  return stickerBuffer;
}

export async function handleStikerTeks(ctx: CommandContext): Promise<void> {
  const text = (ctx.args || '').trim();
  if (!text) {
    try {
      await ctx.sock.sendMessage(ctx.chatId, {
        text: '⚠️ Masukkan teks!\n\nContoh: /stikerteks Jhon338',
      });
    } catch (err) {
      logger.warn({ err, chatId: ctx.chatId }, 'failed sending stikerteks usage');
    }
    return;
  }

  try {
    await ctx.sock.sendMessage(ctx.chatId, {
      react: { text: '⏳', key: ctx.msg!.key },
    });

    const stickerBuffer = await bratToSticker(text);
    const tmpDir = await fs.mkdtemp(path.join(config.mediaDir || '', 'stikerteks-'));
    const filePath = path.join(tmpDir, `${randomUUID()}.webp`);
    await fs.writeFile(filePath, stickerBuffer);

    try {
      const webpImage = await WebpImage.from(stickerBuffer);
      const exifAttr = Buffer.from([
        0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00,
        0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      ]);
      const packName = Buffer.from(STICKER_PACK_NAME, 'utf8');
      const emoji = Buffer.from(STICKER_EMOJI, 'utf8');
      webpImage.exif = Buffer.concat([exifAttr, packName, emoji]);
    } catch (exifErr) {
      logger.warn({ err: exifErr }, 'failed injecting sticker EXIF, skipping');
    }

    await ctx.sock.sendMessage(ctx.chatId, {
      sticker: { url: filePath },
    });

    await ctx.sock.sendMessage(ctx.chatId, {
      react: { text: '✅', key: ctx.msg!.key },
    });

    setTimeout(() => {
      fs.remove(tmpDir).catch(() => {});
    }, 5000);

    logger.info({ chatId: ctx.chatId, text }, 'Brat sticker created');
  } catch (err) {
    logger.error({ err, chatId: ctx.chatId }, 'failed creating brat sticker');
    try {
      await ctx.sock.sendMessage(ctx.chatId, {
        text: '❌ Gagal membuat stiker!',
      });
      await ctx.sock.sendMessage(ctx.chatId, {
        react: { text: '❌', key: ctx.msg!.key },
      });
    } catch (sendErr) {
      logger.warn({ err: sendErr }, 'failed sending stikerteks error');
    }
  }
}

export const stikerteksCommand: CommandHandler = {
  commands: ['stikerteks', 'st', 'stikerbrat', 'brat'],
  description:
    'Buat stiker Brat dari teks. Contoh: /stikerteks Jhon338',
  permission: 'public',
  run: (_sock, _message, ctx) => handleStikerTeks(ctx),
};