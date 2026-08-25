import sharp from 'sharp';
import logger from '../../logger.js';
import { downloadMediaMessage } from 'baileys';
import type { CommandContext, CommandHandler } from '../command/CommandContext.js';

async function handleSetpp({ chatId, sock, msg, senderIsOwner }: CommandContext): Promise<void> {
  if (!senderIsOwner) {
    await sock.sendMessage(chatId, { text: '❌ Khusus Owner!' });
    return;
  }
  
  const rawMsg = msg as any;
  const quoted = rawMsg?.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  
  if (!quoted || !quoted.imageMessage) {
    await sock.sendMessage(chatId, { text: '⚠️ Kirim/Reply gambar dengan caption /setpp' });
    return;
  }
  
  try {
    // Download buffer gambar dari pesan yang di-quote
    const buffer = await downloadMediaMessage(
      { message: quoted },
      'buffer',
      {},
      { logger }
    );
    
    if (!buffer) {
      await sock.sendMessage(chatId, { text: '❌ Gagal download gambar!' });
      return;
    }
    
    // Resize jadi 300x300 (PP WhatsApp)
    const resized = await sharp(buffer)
      .resize(300, 300, { fit: 'cover' })
      .jpeg()
      .toBuffer();
    
    // Update PP grup
    await sock.updateProfilePicture(chatId, resized);
    await sock.sendMessage(chatId, { text: '✅ Foto profil grup berhasil diganti!' });
  } catch (err) {
    logger.error({ err, chatId }, 'failed setpp');
    await sock.sendMessage(chatId, { text: '❌ Gagal ganti foto profil! Pastikan bot admin.' });
  }
}

export const setppCommand: CommandHandler = {
  commands: ['setpp', 'setppgroup'],
  description: 'Ganti foto profil grup (owner only). Reply gambar terus /setpp.',
  permission: 'isOwner',
  run: (_sock, _message, ctx) => handleSetpp(ctx),
};