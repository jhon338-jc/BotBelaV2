import logger from '../../logger.js';
import type { CommandContext, CommandHandler } from '../command/CommandContext.js';

async function handleGroupLink({ chatId, sock, chatType, senderIsAdmin, senderIsOwner }: CommandContext): Promise<void> {
  if (chatType !== 'group') {
    await sock.sendMessage(chatId, { text: '❌ Command ini cuma buat grup!' });
    return;
  }

  if (!senderIsAdmin && !senderIsOwner) {
    await sock.sendMessage(chatId, { text: '❌ Khusus admin/owner grup!' });
    return;
  }

  try {
    const code = await sock.groupInviteCode(chatId);
    const link = `https://chat.whatsapp.com/${code}`;
    await sock.sendMessage(chatId, { text: `🔗 Link grup:\n${link}` });
  } catch (err) {
    logger.warn({ err, chatId }, 'failed getting group link');
    await sock.sendMessage(chatId, { text: '❌ Gagal ambil link grup! Pastikan bot admin.' });
  }
}

export const groupLinkCommand: CommandHandler = {
  commands: ['grouplink', 'linkgrup', 'linkgc', 'invitelink'],
  description: 'Ambil link invite grup WhatsApp. Khusus admin/owner grup.',
  permission: 'group and (admin or owner)',
  run: (_sock, _message, ctx) => handleGroupLink(ctx),
};