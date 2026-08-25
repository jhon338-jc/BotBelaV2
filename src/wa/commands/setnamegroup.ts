import logger from '../../logger.js';
import type { CommandContext, CommandHandler } from '../command/CommandContext.js';

async function handleSetNameGroup({ chatId, args, sock, senderIsOwner }: CommandContext): Promise<void> {
  if (!senderIsOwner) {
    await sock.sendMessage(chatId, { text: '❌ Khusus Owner!' });
    return;
  }
  const name = args?.trim();
  if (!name) {
    await sock.sendMessage(chatId, { text: '⚠️ Cara pakai: /setnamegroup <nama baru>' });
    return;
  }
  try {
    await sock.groupUpdateSubject(chatId, name);
    await sock.sendMessage(chatId, { text: `✅ Nama grup diganti jadi: ${name}` });
  } catch (err) {
    logger.error({ err, chatId }, 'failed setnamegroup');
    await sock.sendMessage(chatId, { text: '❌ Gagal ganti nama grup! Pastikan bot admin.' });
  }
}

export const setNameGroupCommand: CommandHandler = {
  commands: ['setnamegroup', 'setname'],
  description: 'Ganti nama grup (owner only). Contoh: /setnamegroup Nama Baru',
  permission: 'isOwner',
  run: (_sock, _message, ctx) => handleSetNameGroup(ctx),
};
