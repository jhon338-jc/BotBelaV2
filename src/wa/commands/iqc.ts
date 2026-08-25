import logger from '../../logger.js';
import type { CommandContext, CommandHandler } from '../command/CommandContext.js';

async function handleIqc({ chatId, args, sock, msg }: CommandContext): Promise<void> {
  const nama = args?.trim() || 'User';
  try {
    await sock.sendMessage(chatId, { react: { text: '⏳', key: msg!.key } });
    const url = `https://api.azbry.com/api/maker/iqc?text=${encodeURIComponent(nama)}`;
    await sock.sendMessage(chatId, { image: { url }, caption: `🧠 IQ Checker - ${nama}` });
    await sock.sendMessage(chatId, { react: { text: '✅', key: msg!.key } });
  } catch (err) {
    logger.error({ err, chatId }, 'failed iqc');
    try {
      await sock.sendMessage(chatId, { text: '❌ Gagal cek IQ!' });
      await sock.sendMessage(chatId, { react: { text: '❌', key: msg!.key } });
    } catch (e) { /* ignore */ }
  }
}

export const iqcCommand: CommandHandler = {
  commands: ['iqc', 'iq'],
  description: 'Cek IQ random. Contoh: /iqc Budi',
  permission: 'public',
  run: (_sock, _message, ctx) => handleIqc(ctx),
};