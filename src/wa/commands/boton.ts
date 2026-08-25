import type { CommandContext, CommandHandler } from "../command/CommandContext.js";
import { setChatEnabled } from "../botConfig.js";

async function handleBoton({ chatId, repos, sock, senderIsOwner }: CommandContext): Promise<void> {
  if (!senderIsOwner) {
    await sock?.sendMessage(chatId, { text: "Cuma owner yang bisa aktifin bot 😊" });
    return;
  }
  if (!repos) return;
  
  // Aktifin bot
  setChatEnabled(repos, chatId, true);
  
  // Auto-set model ke BELA_UTAMA
  try {
    repos.model.setLlm2Model(chatId, "BELA_UTAMA");
  } catch (err) {
    // ignore — model default tetep kepake
  }
  
  await sock?.sendMessage(chatId, { text: "Bot udah aktif di chat ini! 🔥" });
}

export const botonCommand: CommandHandler = {
  commands: ["boton"],
  description: "Aktifkan bot di chat ini (owner only)",
  permission: "owner",
  run: (_sock, _message, ctx) => handleBoton(ctx),
};