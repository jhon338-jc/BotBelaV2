import { randomUUID } from "crypto";
import config from "../../config.js";
import * as registry from "../../server/accountRegistry.js";
import type { CommandContext, CommandHandler } from "../command/CommandContext.js";
import { rewritePromptMentions } from "./prompt.js";

/** Parse dan canonicalize token 24 jam HH:MM. */
export function parseDailyTime(token: string): string | null {
  const match = (token || "").match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) return null;
  if (!Number.isInteger(minute) || minute < 0 || minute > 59) return null;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

const USAGE =
  "🔁 *Tugas harian*\n\n" +
  "Command:\n" +
  "`/daily-task` — tampilkan tugas harian chat ini\n" +
  "`/daily-task add <HH:MM> <prompt>` — tambah tugas\n" +
  "`/daily-task delete <taskId>` — hapus tugas yang ada di daftar\n\n" +
  "Waktu memakai zona waktu konteks bot (`CONTEXT_TIME_UTC_OFFSET_HOURS`; waktu lokal server jika tidak diatur).\n\n" +
  "Contoh:\n" +
  "_/daily-task add 08:00 Ingatkan @Budi (abc123) untuk mengumpulkan laporan_\n\n" +
  "Gunakan format `@Nama (senderRef)` di prompt yang dibuat LLM; mention WhatsApp manusia dikonversi otomatis.";

export async function handleDailyTask(ctx: CommandContext): Promise<void> {
  const { chatId, args, folderPath = config.dataDir, sock, account, msg } = ctx;
  const trimmed = (args || "").trim();

  // Command tanpa argumen memang operasi list: bridge yang memegang
  // record persisten, jadi dia bisa menampilkan ID dan prompt dengan akurat.
  if (!trimmed) {
    registry.sendReliableToClient(folderPath, {
      type: "daily_task_list",
      folderPath,
      chatId,
    });
    return;
  }

  const commandEnd = trimmed.search(/\s/);
  const action = (commandEnd === -1 ? trimmed : trimmed.slice(0, commandEnd)).toLowerCase();
  const remainder = commandEnd === -1 ? "" : trimmed.slice(commandEnd + 1).trim();

  if (action === "delete") {
    // Daftar menampilkan delapan karakter awal ID. Bridge menyelesaikannya
    // di dalam chat ini, jadi satu chat tidak akan bisa menghapus tugas chat lain.
    if (!remainder || /\s/.test(remainder)) {
      try {
        await sock.sendMessage(chatId, { text: USAGE });
      } catch {
        /* ignore */
      }
      return;
    }
    registry.sendReliableToClient(folderPath, {
      type: "daily_task_delete",
      folderPath,
      chatId,
      taskId: remainder,
    });
    return;
  }

  if (action !== "add") {
    try {
      await sock.sendMessage(chatId, { text: USAGE });
    } catch {
      /* ignore */
    }
    return;
  }

  const spaceIdx = remainder.search(/\s/);
  const timeToken = spaceIdx === -1 ? remainder : remainder.slice(0, spaceIdx);
  let prompt = spaceIdx === -1 ? "" : remainder.slice(spaceIdx + 1).trim();
  const timeOfDay = parseDailyTime(timeToken);

  if (!timeOfDay || !prompt) {
    try {
      await sock.sendMessage(chatId, { text: USAGE });
    } catch {
      /* ignore */
    }
    return;
  }

  if (account) {
    try {
      prompt = await rewritePromptMentions(account, chatId, prompt, msg);
    } catch {
      /* best effort: pertahankan prompt asli */
    }
  }

  const taskId = randomUUID();
  registry.sendReliableToClient(folderPath, {
    type: "daily_task",
    folderPath,
    chatId,
    taskId,
    timeOfDay,
    prompt,
  });

  try {
    await sock.sendMessage(chatId, {
      text: `🔁 Tugas harian dijadwalkan pada ${timeOfDay}. ID: ${taskId.slice(0, 8)}.`,
    });
  } catch {
    /* ignore */
  }
}

export const dailyTaskCommand: CommandHandler = {
  commands: ["daily-task"],
  description:
    "Tampilkan, tambah, atau hapus tugas harian berulang. Gunakan /daily-task, /daily-task add <HH:MM> <prompt>, atau /daily-task delete <taskId>.",
  permission: "public",
  run: (_sock, _message, ctx) => handleDailyTask(ctx),
};