// /compat — atur "mode kompatibilitas" pesan interaktif untuk chat ini.
//
// Mencerminkan bagian menu "Compatibility" di /setting sebagai command ketik
// supaya bisa diakses dari menu pengaturan TEXT juga (pemanggil iOS/web/desktop
// tidak bisa mengetuk menu single_select). Mode ini hanya dibaca oleh gateway
// Node ketika memutuskan apakah akan mengirim pesan interaktif, jadi — tidak
// seperti /mode — tidak perlu broadcast `invalidate_chat_settings` ke bridge Python.
import { parseConfigScope, scopeSuffix } from "./configScope.js";
import { VALID_COMPAT_MODES } from "../../db/repositories/SettingsRepository.js";
import type { CommandContext, CommandHandler } from "../command/CommandContext.js";

const COMPAT_LABELS: Record<string, string> = {
  auto: "sesuaikan perangkat chat (Android→full, iOS→semi, web/desktop→safe)",
  full: "semua fitur interaktif (Android)",
  semi: "tanpa menu list / single-select (aman untuk iOS)",
  safe: "teks biasa saja — berfungsi di mana saja, termasuk WhatsApp Web",
};

async function handleCompat({
  chatId,
  senderIsOwner,
  args,
  sock,
  repos,
}: CommandContext): Promise<void> {
  if (!args || !args.trim()) {
    const current = repos!.settings.getCompatibilityMode(chatId);
    try {
      await sock.sendMessage(chatId, {
        text:
          `Mode kompatibilitas saat ini: *${current}* — ${COMPAT_LABELS[current] || ""}\n\n` +
          "Cara pakai: `/compat` auto | full | semi | safe\n" +
          "- *auto*: sesuaikan perangkat chat secara otomatis\n" +
          "- *full*: semua interaktif (Android)\n" +
          "- *semi*: tanpa menu list (iOS)\n" +
          "- *safe*: teks biasa saja (web/desktop)\n\n" +
          "Owner: `/compat global <mode>` (semua chat), `/compat default <mode>` (chat yang belum diatur)",
      });
    } catch (err) {
      /* ignore */
    }
    return;
  }

  const parts = args.trim().toLowerCase().split(/\s+/);
  const scope = parseConfigScope(parts[0]);
  const isScoped = scope !== "chat";
  const mode = isScoped ? parts[1] : parts[0];

  if (!mode || !VALID_COMPAT_MODES.has(mode)) {
    try {
      await sock.sendMessage(chatId, {
        text: "Mode tidak valid. Pilih: auto, full, semi, atau safe.",
      });
    } catch (err) {
      /* ignore */
    }
    return;
  }

  if (isScoped) {
    if (!senderIsOwner) {
      try {
        await sock.sendMessage(chatId, {
          text: "Hanya owner bot yang bisa mengatur mode kompatibilitas global/default.",
        });
      } catch (err) {
        /* ignore */
      }
      return;
    }
    if (scope === "default") {
      repos!.settings.setDefaultCompatibilityMode(mode);
    } else {
      repos!.settings.setGlobalCompatibilityMode(mode);
    }
  } else {
    repos!.settings.setCompatibilityMode(chatId, mode);
  }

  try {
    await sock.sendMessage(chatId, {
      text: `Mode kompatibilitas diperbarui${scopeSuffix(scope)}: *${mode}*`,
    });
  } catch (err) {
    /* ignore */
  }
}

export { handleCompat };

export const compatCommand: CommandHandler = {
  commands: ["compat", "compatibility"],
  description:
    "Atur fitur pesan interaktif yang digunakan bot di chat ini. auto = sesuaikan perangkat chat; full = semua (Android); semi = tanpa menu list (iOS); safe = teks biasa saja (berfungsi di WhatsApp Web). Tanpa argumen menampilkan mode saat ini. Contoh: /compat safe.",
  permission: "isPrivate or isAdmin or isOwner",
  run: (_sock, _message, ctx) => handleCompat(ctx),
};