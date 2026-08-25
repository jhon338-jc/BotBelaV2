import type { CommandContext, CommandHandler } from "../command/CommandContext.js";
import { setChatEnabled } from "../botConfig.js";

async function handleBoton({ chatId, repos, sock, senderIsOwner }: CommandContext): Promise<void> {
  if (!senderIsOwner) {
    await sock?.sendMessage(chatId, { text: "Cuma owner yang bisa aktifin bot 😊" });
    return;
  }
  if (!repos) return;
  setChatEnabled(repos, chatId, true);
  await sock?.sendMessage(chatId, { text: "Bot udah aktif di chat ini! 🔥" });
}

export const botonCommand: CommandHandler = {
  commands: ["boton"],
  description: "Aktifkan bot di chat ini (owner only)",
  permission: "owner",
  run: (_sock, _message, ctx) => handleBoton(ctx),
};