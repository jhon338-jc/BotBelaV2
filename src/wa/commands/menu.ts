import type { CommandContext, CommandHandler } from '../command/CommandContext.js';

const MENU_TEXT = `
🤖 *MENU BELA* 🤖

📥 *DOWNLOAD*
- /download <link> — Unduh TikTok/YT/IG

🎨 *STIKER*
- /stikerteks (teks) — Stiker Brat dari teks
- /sticker — Stiker dari gambar/video (reply)
- /sticker teks — Stiker + teks (reply)
- /add-sticker <nama> — Tambah stiker ke katalog (reply stiker)
- /remove-sticker <nama> — Hapus stiker dari katalog

🖼️ *PAP & MEDIA*
- /pap — PAP random
- /papmmk — PAP memek
- /paptt — PAP susu
- /papbugil — PAP bugil
- /media — Lihat daftar media
- /rvo — Buka view-once (reply pesan)

🛡️ *GRUP*
- /group add @nomor — Tambah member
- /group kick @nama — Kick member
- /group mute @nama 5 — Mute 5 menit
- /group close/open — Tutup/buka grup
- /group delete — Hapus pesan (reply)
- /group pin <1|7|30> — Pin pesan (reply)
- /group description <teks> — Ubah deskripsi grup
- /permission 3 — Level moderasi (0-3)
- /trigger <jenis> on/off — Atur pemicu respons
- /idle <n> — Idle trigger
- /grouplink — Ambil link invite grup

🧠 *MEMORY & KONTEKS*
- /memory add <teks> — Simpan fakta
- /memory — Lihat memory
- /memory delete <index> — Hapus memory
- /reset — Bersihkan riwayat chat
- /dump — Ekspor konteks LLM
- /prompt <teks> — Atur system prompt
- /prompt join <teks> — Pesan saat join grup

⏰ *TUGAS & ALARM*
- /schedule-task 30M <tugas> — Set alarm
- /daily-task — Lihat tugas harian
- /daily-task add <HH:MM> <tugas> — Tambah tugas harian
- /daily-task delete <taskId> — Hapus tugas harian

🔍 *INFO & STATISTIK*
- /iqc <nama> — Cek IQ random
- /dashboard — Statistik penggunaan
- /info — Info chat & bot
- /owner-contact — Kontak owner

⚙️ *PENGATURAN*
- /mode <auto|prefix|hybrid> — Atur mode respons
- /model — Lihat/atur model LLM
- /compat <auto|full|semi|safe> — Mode pesan interaktif
- /setting — Menu pengaturan interaktif
- /announcement <on|off> — Broadcast setting
- /help — List lengkap semua command

👑 *OWNER*
- /boton — Aktifkan bot
- /botoff — Matikan bot
- /broadcast <teks> — Broadcast
- /monitor — Dashboard
- /bot-conf — Konfigurasi global
- /kirim-media — PAP & media
- /join <link> — Join grup
- /generate — Buat kode aktivasi
- /revoke <id> — Cabut kode aktivasi
- /setnamegroup <nama> — Ganti nama grup
- /setpp — Ganti PP grup (reply gambar)
- /modelcfg — Konfigurasi model
- /subagent <on|off> — Sub-agent
- /update — Update bot

Ketik /help buat info detail tiap command.
`.trim();

async function handleMenu({ chatId, sock }: CommandContext): Promise<void> {
  try {
    await sock.sendMessage(chatId, { text: MENU_TEXT });
  } catch (err) {
    /* ignore */
  }
}

export const menuCommand: CommandHandler = {
  commands: ['menubela', 'mb'],
  description: 'Tampilkan menu fitur utama.',
  permission: 'public',
  run: (_sock, _message, ctx) => handleMenu(ctx),
};