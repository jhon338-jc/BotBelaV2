import logger from '../../logger.js';
import { downloadMediaMessage } from 'baileys';
import type { CommandContext, CommandHandler } from '../command/CommandContext.js';

async function handleRvo({ chatId, sock, msg, account }: CommandContext): Promise<void> {
  const rawMsg = msg as any;
  
  try {
    await sock.sendMessage(chatId, { react: { text: '⏳', key: msg!.key } });
    
    // Ambil quoted message
    const quoted = rawMsg?.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    
    if (!quoted) {
      await sock.sendMessage(chatId, { text: '❗ Reply pesan view-once!' });
      await sock.sendMessage(chatId, { react: { text: '❌', key: msg!.key } });
      return;
    }
    
    // Cek media dari berbagai lokasi
    const imageMedia = quoted?.imageMessage || quoted?.viewOnceMessage?.message?.imageMessage;
    const videoMedia = quoted?.videoMessage || quoted?.viewOnceMessage?.message?.videoMessage;
    const audioMedia = quoted?.audioMessage || quoted?.viewOnceMessage?.message?.audioMessage;
    
    let mediaType: 'image' | 'video' | 'audio' | null = null;
    if (imageMedia) mediaType = 'image';
    else if (videoMedia) mediaType = 'video';
    else if (audioMedia) mediaType = 'audio';
    
    if (!mediaType) {
      await sock.sendMessage(chatId, { text: '❌ Media view-once tidak ditemukan atau sudah terhapus!' });
      await sock.sendMessage(chatId, { react: { text: '❌', key: msg!.key } });
      return;
    }
    
    // Download buffer media
    const buffer = await downloadMediaMessage(
      { message: quoted },
      'buffer',
      {},
      { logger }
    );
    
    if (!buffer) {
      await sock.sendMessage(chatId, { text: '❌ Gagal download media view-once!' });
      await sock.sendMessage(chatId, { react: { text: '❌', key: msg!.key } });
      return;
    }
    
    // Kirim ulang media
    if (mediaType === 'image') {
      await sock.sendMessage(chatId, { 
        image: buffer,
        caption: '🔓 View-Once by Bela',
      });
    } else if (mediaType === 'video') {
      await sock.sendMessage(chatId, { 
        video: buffer,
        caption: '🔓 View-Once by Bela',
      });
    } else if (mediaType === 'audio') {
      await sock.sendMessage(chatId, { 
        audio: buffer,
        mimetype: audioMedia?.mimetype || 'audio/ogg',
        ptt: true,
      });
    }
    
    await sock.sendMessage(chatId, { react: { text: '✅', key: msg!.key } });
    
  } catch (err) {
    logger.error({ err, chatId }, 'failed rvo');
    try {
      await sock.sendMessage(chatId, { text: '❌ Error! Media view-once sudah tidak bisa di-download.' });
      await sock.sendMessage(chatId, { react: { text: '❌', key: msg!.key } });
    } catch (e) { /* ignore */ }
  }
}

export const rvoCommand: CommandHandler = {
  commands: ['rvo', 'readvo', 'viewonce'],
  description: 'Download & kirim ulang pesan view-once. Reply pesan view-once lalu /rvo.',
  permission: 'public',
  run: (_sock, _message, ctx) => handleRvo(ctx),
};