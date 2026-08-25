import logger from '../../logger.js';
import type { CommandContext, CommandHandler } from '../command/CommandContext.js';

async function handleActivate({ chatId, chatType, args, sock, repos }: CommandContext): Promise<void> {
  const code = (args || '').trim().toUpperCase();

  if (!code) {
    // Di chat pribadi, jangan pernah kirim pesan apa pun saat belum aktif (risiko banned).
    if (chatType !== 'private') {
      try {
        await sock.sendMessage(chatId, { text: 'Cara pakai: /activate <kode>' });
      } catch (err) { /* ignore */ }
    }
    return;
  }

  const result = repos!.activation.activateChat(chatId, code, chatType as string);

  // Di chat pribadi, sembunyikan pesan error (kode sudah dipakai/salah) untuk
  // menghindari risiko banned. Hanya kirim pesan sukses atau pesan non-private.
  if (chatType !== 'private' || result.success) {
    try {
      await sock.sendMessage(chatId, { text: result.message });
    } catch (err) {
      logger.warn({ err, chatId }, 'gagal mengirim respons /activate');
    }
  }
}

export { handleActivate };

export const activateCommand: CommandHandler = {
  commands: ["activate"],
  description: "Aktifkan chat ini menggunakan kode aktivasi yang diberikan owner. Setelah aktif, bot akan merespons pesan di chat ini. Contoh: /activate WA-ABC12345.",
  permission: "public",
  run: (_sock, _message, ctx) => handleActivate(ctx),
};