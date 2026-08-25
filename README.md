# 🤖 Bot Bela V2

[![Node 18+](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org/)
[![Python 3.10+](https://img.shields.io/badge/python-%3E%3D3.10-blue)](https://python.org/)
[![License](https://img.shields.io/badge/license-ISC-lightgrey)](./package.json)
[![GitHub stars](https://img.shields.io/github/stars/jhon338-jc/BotBelaV2?style=social)](https://github.com/jhon338-jc/BotBelaV2)

**BELA** — WhatsApp AI bot cewek Indonesia yang imut, gemes, gaul, dan punya kepribadian nyata. Dia bisa ngobrol natural, nyimpen memory, bikin stiker, download video, manage grup, RVO view-once, dan masih banyak lagi — semua TANPA harus pake slash command!

Bela nggak cuma bot biasa. Dia punya emosi, bisa baper, manja, ngeselin, dan ngobrol kayak cewek beneran.

---

## 📑 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Semua Command](#-semua-command)
- [Cara Install](#-cara-install)
- [Konfigurasi](#-konfigurasi)
- [9Router Setup](#-9router-setup)
- [Mode Respons](#-mode-respons)
- [Permission Level](#-permission-level)
- [FAQ](#-faq)
- [Kontributor](#-kontributor)

---

## ✨ Fitur Utama

### 🎭 AI Kepribadian
- Cewek Indonesia umur 18 tahun yang manis, lembut, imut, dan gemes
- Bisa basa-basi, grogi, malu-malu, baper, excited, moody
- Paham bahasa natural — tanpa slash command
- Auto-save memory — ingat user selamanya
- Paham semua variasi panggilan: Bel, Bell, Bela, Bella, Belll, ayang bela, dll
- Ngobrol dewasa (18+) natural tanpa sensor
- Support multi-provider AI via 9Router (fallback otomatis)
- Gaul banget — pake bahasa Indonesia santai kayak chat cewek beneran

### 📥 Download Video
- TikTok
- YouTube
- Instagram
- Facebook
- Platform lain
- Tinggal kirim link, bot langsung download

### 🎨 Stiker
- Stiker dari gambar/video (`/sticker`)
- Stiker Brat dari teks (`/stikerteks`)
- Katalog stiker custom
- Tambah stiker (`/add-sticker <nama>`)
- Hapus stiker (`/remove-sticker <nama>`)

### 🔓 RVO (View-Once)
- Buka pesan view-once yang di-reply
- Support gambar, video, dan audio
- Works di grup & DM
- Bisa dipake semua orang

### 🛡️ Group Management
- Kick member (support format 08xx, 62xx, +62 xx)
- Tambah member (support format 08xx, 62xx, +62 xx)
- Mute member
- Delete pesan (reply)
- Pin pesan (reply + pilih durasi 24 jam/7 hari/30 hari)
- Ganti nama grup
- Ganti PP grup
- Ganti deskripsi grup
- Ambil link invite grup
- Tutup / buka grup
- Permission level (0-3)

### 🧠 Memory System
- Bot ingat fakta user
- Auto-save informasi penting
- Lanjut ngobrol besok tanpa lupa
- Memory global & per-chat
- Lihat memory (`/memory`)
- Hapus memory (`/memory delete`)
- Global memory (owner only)

### ⏰ Scheduling
- Jadwalkan tugas sekali (`/schedule-task 30M rapat`)
- Tugas harian (`/daily-task add 07:00 bangun`)
- Hapus tugas harian (`/daily-task delete`)
- Idle trigger (`/idle 5-10`)

### 🖼️ PAP & Media
- PAP random (`/pap`)
- PAP memek (`/papmmk`) — owner only
- PAP susu (`/paptt`) — owner only
- PAP bugil (`/papbugil`) — owner only
- Kirim media random (`/media`)

### 👑 Owner Features
- Broadcast ke semua grup (`/broadcast`)
- Config global (`/bot-conf`)
- Generate kode aktivasi (`/generate`)
- Revoke kode (`/revoke`)
- Join grup via link (`/join`)
- Kontak owner (`/owner-contact set`)
- Set PP grup (`/setpp`)
- Set nama grup (`/setnamegroup`)
- Model config (`/modelcfg`)
- Sub-agent (`/subagent`)
- Update bot (`/update`)
- Bot on/off per chat (`/boton`, `/botoff`)
- Monitor dashboard (`/monitor`)

### ⚙️ Mode Respons
- **Auto** — bot auto respond semua pesan
- **Prefix** — cuma respond saat disebut/ditrigger
- **Hybrid** — prefix dulu, auto kalau nggak ada trigger

### 🔍 Info & Statistik
- Cek IQ random (`/iqc`)
- Dashboard statistik (`/dashboard`)
- Info chat & bot (`/info`)
- Menu lengkap (`/menubela`)
- Help (`/help`)
- Dump konteks LLM (`/dump`)

---

## 📋 Semua Command

### 🟢 Umum (Semua Orang)

| Command | Deskripsi |
|---------|-----------|
| `/menubela` | Menu fitur utama |
| `/help` | List semua command |
| `/download <link>` | Download video TikTok/YT/IG/FB |
| `/sticker` | Stiker dari gambar (reply) |
| `/stikerteks <teks>` | Stiker Brat dari teks |
| `/add-sticker <nama>` | Tambah stiker (reply stiker) |
| `/remove-sticker <nama>` | Hapus stiker |
| `/rvo` | Buka view-once (reply) |
| `/pap` | PAP random |
| `/grouplink` | Ambil link grup |
| `/iqc <nama>` | Cek IQ random |
| `/dashboard` | Statistik chat |
| `/info` | Info chat & bot |
| `/schedule-task <durasi> <tugas>` | Jadwalkan tugas |
| `/daily-task` | Tugas harian |
| `/reset` | Bersihkan riwayat chat |
| `/dump` | Ekspor konteks LLM |
| `/owner-contact` | Kontak owner |
| `/catch` | Debug payload pesan |
| `/compat <mode>` | Mode pesan interaktif |
| `/setting` | Menu pengaturan interaktif |

### 🛡️ Admin Grup

| Command | Deskripsi |
|---------|-----------|
| `/group kick @nama` | Kick member |
| `/group add @nomor` | Tambah member |
| `/group mute @nama <menit>` | Mute member |
| `/group delete` | Hapus pesan (reply) |
| `/group pin <1\|7\|30>` | Pin pesan (reply) |
| `/group close/open` | Tutup/buka grup |
| `/group description <teks>` | Ubah deskripsi |
| `/permission <0-3>` | Level moderasi |
| `/trigger <jenis> on/off` | Atur trigger |
| `/idle <n>` | Idle trigger |
| `/mode <auto\|prefix\|hybrid>` | Mode respons |
| `/announcement <on\|off>` | Broadcast setting |
| `/prompt <teks>` | Atur system prompt |
| `/prompt join <teks>` | Pesan saat join grup |

### 👑 Owner

| Command | Deskripsi |
|---------|-----------|
| `/boton` | Aktifkan bot di chat |
| `/botoff` | Matikan bot di chat |
| `/broadcast <teks>` | Broadcast semua grup |
| `/bot-conf` | Config global |
| `/join <link>` | Join grup via link |
| `/generate` | Generate kode aktivasi |
| `/revoke <id>` | Cabut kode aktivasi |
| `/monitor` | Dashboard bot |
| `/model` | Atur model LLM |
| `/modelcfg` | Config model |
| `/memory` | Lihat memory |
| `/memory add <fakta>` | Simpan memory |
| `/memory delete <index>` | Hapus memory |
| `/memory global add` | Memory global |
| `/subagent on/off` | Sub-agent |
| `/kirim-media` | PAP & media |
| `/setnamegroup <nama>` | Ganti nama grup |
| `/setpp` | Ganti PP grup (reply gambar) |
| `/update` | Update bot |

---

## 🚀 Cara Install

### Requirements
- **Node.js 18+** → [Download](https://nodejs.org/)
- **Python 3.10+** → [Download](https://python.org/)
- **Git** → [Download](https://git-scm.com/)
- **9Router** (optional, buat multi-provider AI)

### Step 1: Clone repo
```bash
git clone https://github.com/jhon338-jc/BotBelaV2.git
cd BotBelaV2