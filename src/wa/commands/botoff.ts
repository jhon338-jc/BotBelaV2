import type { CommandContext, CommandHandler } from "../command/CommandContext.js";
import { setChatEnabled } from "../botConfig.js";

async function handleBotoff({ chatId, repos, sock, senderIsOwner }: CommandContext): Promise<void> {
  if (!senderIsOwner) {
    await sock?.sendMessage(chatId, { text: "Cuma owner yang bisa matiin bot 😊" });
    return;
  }
  if (!repos) return;
  setChatEnabled(repos, chatId, false);
  await sock?.sendMessage(chatId, { text: "Bot udah dimatiin di chat ini 😴" });
}

export const botoffCommand: CommandHandler = {
  commands: ["botoff"],
  description: "Matikan bot di chat ini (owner only)",
  permission: "owner",
  run: (_sock, _message, ctx) => handleBotoff(ctx),
};
