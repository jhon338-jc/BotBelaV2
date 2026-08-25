import logger from "../../logger.js";
import { listCommands } from "../command/CommandRegistry.js";
import type {
  CommandContext,
  CommandHandler,
} from "../command/CommandContext.js";

// `/help` dibuat otomatis dari registry command: setiap command terdaftar
// menyumbang token kanonik + deskripsi, jadi menambah command (atau mengedit
// deskripsinya) memperbarui daftar ini otomatis. Command yang ditandai
// `isHidden` dihilangkan. Command khusus owner (permission mengandung atom
// `owner`) dikelompokkan ke bagian terpisah.

/** Command dianggap khusus owner ketika ekspresi permission-nya mengandung `owner`. */
function isOwnerCommand(handler: CommandHandler): boolean {
  return /\bowner\b/.test(handler.permission);
}

function byCanonical(a: CommandHandler, b: CommandHandler): number {
  return a.commands[0].localeCompare(b.commands[0]);
}

function formatLine(handler: CommandHandler): string {
  return `- */\`${handler.commands[0]}\`*\n*Izin* : ${handler.permission}\n*Deskripsi* : ${handler.description}`;
}

/** Buat isi `/help` dari registry yang aktif. */
function buildHelpText(): string {
  const visible = listCommands().filter((c) => !c.isHidden);
  const general = visible.filter((c) => !isOwnerCommand(c)).sort(byCanonical);
  const owner = visible.filter(isOwnerCommand).sort(byCanonical);

  const lines: string[] = ["*BelaSayank — Daftar Command*"];

  lines.push("", "*Umum*", "");
  lines.push(general.map(formatLine).join("\n\n"));

  if (owner.length > 0) {
    lines.push("", "*Owner*", "");
    lines.push(owner.map(formatLine).join("\n\n"));
  }

  lines.push(
    "",
    "_Ketik sebagian nama command tanpa argumen untuk melihat status/nilai saat ini._",
  );

  return lines.join("\n");
}

async function handleHelp({ chatId, sock }: CommandContext): Promise<void> {
  try {
    await sock.sendMessage(chatId, { text: buildHelpText() });
  } catch (err) {
    logger.warn({ err, chatId }, "gagal mengirim respons /help");
  }
}

export { handleHelp, buildHelpText };

export const helpCommand: CommandHandler = {
  commands: ["help", "helps", "menu", "list"],
  description:
    "Tampilkan daftar lengkap semua command yang tersedia beserta level izin dan deskripsinya. Command tersembunyi tidak ditampilkan.",
  permission: "public",
  run: (_sock, _message, ctx) => handleHelp(ctx),
};