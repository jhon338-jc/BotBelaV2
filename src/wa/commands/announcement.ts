import config from "../../config.js";
import * as registry from "../../server/accountRegistry.js";
import { parseConfigScope, scopeSuffix } from "./configScope.js";
import type { CommandContext, CommandHandler } from '../command/CommandContext.js';

async function handleAnnouncement({
  chatId,
  senderIsOwner,
  args,
  folderPath = config.dataDir,
  sock,
  repos,
}: CommandContext): Promise<void> {

  if (!args) {
    const current = repos!.settings.getAnnouncementEnabled(chatId);
    try {
      await sock.sendMessage(chatId, {
        text:
          `Broadcast pengumuman: *${current ? "ON" : "OFF"}*\n\n` +
          "_/announcement on_ — terima broadcast di grup ini\n" +
          "_/announcement off_ — keluar dari broadcast di grup ini\n" +
          "_/announcement global on/off_ — atur default untuk semua grup (khusus owner)\n" +
          "_/announcement default on/off_ — atur untuk grup yang belum mengatur sendiri (khusus owner)",
      });
    } catch (err) {
      /* ignore */
    }
    return;
  }

  const parts = args.trim().toLowerCase().split(/\s+/);
  const scope = parseConfigScope(parts[0]);
  const isScoped = scope !== "chat";
  const value = isScoped ? parts[1] : parts[0];

  if (isScoped && !senderIsOwner) {
    try {
      await sock.sendMessage(chatId, {
        text: "Hanya owner bot yang bisa mengatur pengumuman global/default.",
      });
    } catch (err) {
      /* ignore */
    }
    return;
  }

  if (value === "on" || value === "off") {
    const enabled = value === "on";
    if (scope === "default") {
      repos!.settings.setDefaultAnnouncementEnabled(enabled);
    } else if (scope === "global") {
      repos!.settings.setGlobalAnnouncementEnabled(enabled);
    } else {
      repos!.settings.setAnnouncementEnabled(chatId, enabled);
    }
    registry.sendReliableToClient(folderPath, {
      type: "invalidate_chat_settings",
      folderPath,
      chatId: isScoped ? "global" : chatId,
    });
    try {
      await sock.sendMessage(chatId, {
        text: `Broadcast pengumuman ${enabled ? "diaktifkan" : "dinonaktifkan"}${scopeSuffix(scope)}.`,
      });
    } catch (err) {
      /* ignore */
    }
    return;
  }

  try {
    await sock.sendMessage(chatId, {
      text: "Cara pakai: `/announcement on`, `/announcement off`, `/announcement global on/off`, atau `/announcement default on/off`",
    });
  } catch (err) {
    /* ignore */
  }
}

export { handleAnnouncement };

export const announcementCommand: CommandHandler = {
  commands: ["announcement", "announcements"],
  description: "Atur grup ini untuk menerima atau menolak broadcast dari owner. Tanpa argumen, menampilkan status saat ini. Contoh: /announcement on.",
  permission: "isGroup and (isAdmin or isOwner)",
  run: (_sock, _message, ctx) => handleAnnouncement(ctx),
};