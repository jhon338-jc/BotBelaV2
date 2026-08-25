import logger from '../../logger.js';
import config from '../../config.js';
import type { AccountContext } from '../../account/accountContext.js';

export async function sendWelcomeMessage(
  ctx: AccountContext,
  chatId: string,
  participantName: string,
): Promise<void> {
  try {
    const sock = ctx.sock;
    if (!sock) return;
    const messages = [
      `Haii @${participantName}! 😊 Selamat datang di grup ini~ (｡♥‿♥｡) Jangan lupa baca deskripsi grup ya!`,
      `Welcome @${participantName}! 🎉 Semoga betah disini ya~ (◕‿◕)`,
      `Halo @${participantName}! ✨ Kenalin, aku Bela! Ada yang bisa dibantu? 😊`,
    ];
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
    await sock.sendMessage(chatId, { text: randomMsg });
  } catch (err) {
    logger.warn({ err, chatId }, 'failed sending welcome message');
  }
}

export async function sendGoodbyeMessage(
  ctx: AccountContext,
  chatId: string,
  participantName: string,
): Promise<void> {
  try {
    const sock = ctx.sock;
    if (!sock) return;
    const messages = [
      `Yah @${participantName} keluar... 😢 Semoga sukses selalu ya! (｡•́︿•̀｡)`,
      `Bye @${participantName}... 👋 Makasih udah jadi bagian grup ini! 😊`,
      `@${participantName} left... 😔 Semoga kita ketemu lagi! (◕‿◕)`,
    ];
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
    await sock.sendMessage(chatId, { text: randomMsg });
  } catch (err) {
    logger.warn({ err, chatId }, 'failed sending goodbye message');
  }
}