# 🤖 Bot Bela V2

[![Node 18+](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org/)
[![Python 3.10+](https://img.shields.io/badge/python-%3E%3D3.10-blue)](https://python.org/)
[![License](https://img.shields.io/badge/license-ISC-lightgrey)](./package.json)
[![GitHub stars](https://img.shields.io/github/stars/jhon338-jc/BotBelaV2?style=social)](https://github.com/jhon338-jc/BotBelaV2)

**BELA** — WhatsApp AI bot cewek Indonesia yang imut, gemes, gaul, dan punya kepribadian nyata. Dia bisa ngobrol natural, nyimpen memory, bikin stiker, download video, manage grup, RVO view-once, dan masih banyak lagi — semua TANPA harus pake slash command!

Bela nggak cuma bot biasa. Dia punya emosi, bisa baper, manja, ngeselin, dan ngobrol kayak cewek beneran.

---

## 📑 Daftar Isi

* [Fitur Utama](#-fitur-utama)
* [Semua Command](#-semua-command)
* [Cara Install](#-cara-install)
* [Konfigurasi](#-konfigurasi)
* [9Router Setup](#-9router-setup)
* [Mode Respons](#-mode-respons)
* [Permission Level](#-permission-level)
* [FAQ](#-faq)
* [License](#-license)
* [Kontributor](#-kontributor)

---

## ✨ Fitur Utama

### 🎭 AI Kepribadian

* Cewek Indonesia umur 18 tahun yang manis, lembut, imut, dan gemes
* Bisa basa-basi, grogi, malu-malu, baper, excited, moody
* Paham bahasa natural — tanpa slash command
* Auto-save memory — ingat user selamanya
* Paham semua variasi panggilan: Bel, Bell, Bela, Bella, Belll, ayang bela, dll
* Ngobrol dewasa (18+) natural tanpa sensor
* Support multi-provider AI via 9Router (fallback otomatis)
* Gaul banget — pake bahasa Indonesia santai kayak chat cewek beneran

### 📥 Download Video

* TikTok
* YouTube
* Instagram
* Facebook
* Platform lain
* Tinggal kirim link, bot langsung download

### 🎨 Stiker

* Stiker dari gambar/video (`/sticker`)
* Stiker Brat dari teks (`/stikerteks`)
* Katalog stiker custom
* Tambah stiker (`/add-sticker <nama>`)
* Hapus stiker (`/remove-sticker <nama>`)

### 🔓 RVO (View-Once)

* Buka pesan view-once yang di-reply
* Support gambar, video, dan audio
* Works di grup & DM
* Bisa dipake semua orang

### 🛡️ Group Management

* Kick member (support format 08xx, 62xx, +62 xx)
* Tambah member (support format 08xx, 62xx, +62 xx)
* Mute member
* Delete pesan (reply)
* Pin pesan (reply + pilih durasi 24 jam/7 hari/30 hari)
* Ganti nama grup
* Ganti PP grup
* Ganti deskripsi grup
* Ambil link invite grup
* Tutup / buka grup
* Permission level (0-3)

### 🧠 Memory System

* Bot ingat fakta user
* Auto-save informasi penting
* Lanjut ngobrol besok tanpa lupa
* Memory global & per-chat
* Lihat memory (`/memory`)
* Hapus memory (`/memory delete`)
* Global memory (owner only)

### ⏰ Scheduling

* Jadwalkan tugas sekali (`/schedule-task 30M rapat`)
* Tugas harian (`/daily-task add 07:00 bangun`)
* Hapus tugas harian (`/daily-task delete`)
* Idle trigger (`/idle 5-10`)

### 🖼️ PAP & Media

* PAP random (`/pap`)
* PAP memek (`/papmmk`) — owner only
* PAP susu (`/paptt`) — owner only
* PAP bugil (`/papbugil`) — owner only
* Kirim media random (`/media`)

### 👑 Owner Features

* Broadcast ke semua grup (`/broadcast`)
* Config global (`/bot-conf`)
* Generate kode aktivasi (`/generate`)
* Revoke kode (`/revoke`)
* Join grup via link (`/join`)
* Kontak owner (`/owner-contact set`)
* Set PP grup (`/setpp`)
* Set nama grup (`/setnamegroup`)
* Model config (`/modelcfg`)
* Sub-agent (`/subagent`)
* Update bot (`/update`)
* Bot on/off per chat (`/boton`, `/botoff`)
* Monitor dashboard (`/monitor`)

### ⚙️ Mode Respons

* **Auto** — bot auto respond semua pesan
* **Prefix** — cuma respond saat disebut/ditrigger
* **Hybrid** — prefix dulu, auto kalau nggak ada trigger

### 🔍 Info & Statistik

* Cek IQ random (`/iqc`)
* Dashboard statistik (`/dashboard`)
* Info chat & bot (`/info`)
* Menu lengkap (`/menubela`)
* Help (`/help`)
* Dump konteks LLM (`/dump`)

---

## 📋 Semua Command

### 🟢 Umum (Semua Orang)

| Command                           | Deskripsi                      |
| --------------------------------- | ------------------------------ |
| `/menubela`                       | Menu fitur utama               |
| `/help`                           | List semua command             |
| `/download <link>`                | Download video TikTok/YT/IG/FB |
| `/sticker`                        | Stiker dari gambar (reply)     |
| `/stikerteks <teks>`              | Stiker Brat dari teks          |
| `/add-sticker <nama>`             | Tambah stiker (reply stiker)   |
| `/remove-sticker <nama>`          | Hapus stiker                   |
| `/rvo`                            | Buka view-once (reply)         |
| `/pap`                            | PAP random                     |
| `/grouplink`                      | Ambil link grup                |
| `/iqc <nama>`                     | Cek IQ random                  |
| `/dashboard`                      | Statistik chat                 |
| `/info`                           | Info chat & bot                |
| `/schedule-task <durasi> <tugas>` | Jadwalkan tugas                |
| `/daily-task`                     | Tugas harian                   |
| `/reset`                          | Bersihkan riwayat chat         |
| `/dump`                           | Ekspor konteks LLM             |
| `/owner-contact`                  | Kontak owner                   |
| `/catch`                          | Debug payload pesan            |
| `/compat <mode>`                  | Mode pesan interaktif          |
| `/setting`                        | Menu pengaturan interaktif     |

### 🛡️ Admin Grup

| Command                        | Deskripsi            |
| ------------------------------ | -------------------- |
| `/group kick @nama`            | Kick member          |
| `/group add @nomor`            | Tambah member        |
| `/group mute @nama <menit>`    | Mute member          |
| `/group delete`                | Hapus pesan (reply)  |
| `/group pin <1\|7\|30>`        | Pin pesan (reply)    |
| `/group close/open`            | Tutup/buka grup      |
| `/group description <teks>`    | Ubah deskripsi       |
| `/permission <0-3>`            | Level moderasi       |
| `/trigger <jenis> on/off`      | Atur trigger         |
| `/idle <n>`                    | Idle trigger         |
| `/mode <auto\|prefix\|hybrid>` | Mode respons         |
| `/announcement <on\|off>`      | Broadcast setting    |
| `/prompt <teks>`               | Atur system prompt   |
| `/prompt join <teks>`          | Pesan saat join grup |

### 👑 Owner

| Command                  | Deskripsi                    |
| ------------------------ | ---------------------------- |
| `/boton`                 | Aktifkan bot di chat         |
| `/botoff`                | Matikan bot di chat          |
| `/broadcast <teks>`      | Broadcast semua grup         |
| `/bot-conf`              | Config global                |
| `/join <link>`           | Join grup via link           |
| `/generate`              | Generate kode aktivasi       |
| `/revoke <id>`           | Cabut kode aktivasi          |
| `/monitor`               | Dashboard bot                |
| `/model`                 | Atur model LLM               |
| `/modelcfg`              | Config model                 |
| `/memory`                | Lihat memory                 |
| `/memory add <fakta>`    | Simpan memory                |
| `/memory delete <index>` | Hapus memory                 |
| `/memory global add`     | Memory global                |
| `/subagent on/off`       | Sub-agent                    |
| `/kirim-media`           | PAP & media                  |
| `/setnamegroup <nama>`   | Ganti nama grup              |
| `/setpp`                 | Ganti PP grup (reply gambar) |
| `/update`                | Update bot                   |

---

## 🚀 Cara Install

### Requirements

* **Node.js 18+** → [Download](https://nodejs.org/)
* **Python 3.10+** → [Download](https://python.org/)
* **Git** → [Download](https://git-scm.com/)
* **9Router** (optional, buat multi-provider AI)

### Step 1: Clone repo

```bash
git clone https://github.com/jhon338-jc/BotBelaV2.git
cd BotBelaV2
```

### Step 2: Install dependency Node.js

```bash
npm install
```

### Step 3: Install dependency Python

Jika project menyediakan `requirements.txt`:

```bash
pip install -r requirements.txt
```

Atau:

```bash
python -m pip install -r requirements.txt
```

### Step 4: Konfigurasi environment

Jika project menggunakan file `.env`, buat file:

```bash
cp .env.example .env
```

Kemudian isi konfigurasi yang diperlukan di `.env`.

> **Catatan:** Jangan upload `.env` yang berisi API key, token, session, password, atau credential pribadi ke GitHub.

### Step 5: Jalankan Bot

Contoh menjalankan project:

```bash
npm start
```

Jika project menggunakan file utama secara langsung:

```bash
node index.js
```

Sesuaikan command dengan `package.json` dan entry point yang digunakan oleh project.

---

## ⚙️ Konfigurasi

Konfigurasi bot dapat disesuaikan melalui file konfigurasi/environment yang tersedia di project.

Beberapa konfigurasi utama yang dapat digunakan:

* API provider AI
* Model LLM
* 9Router
* Prefix bot
* Owner
* Permission level
* Mode respons
* Memory
* Group management
* Scheduling
* Media downloader
* Sticker system
* Bot on/off per chat

> **Penting:** Nama environment variable harus mengikuti konfigurasi yang memang digunakan oleh source code project. Jangan mengganti nama variable secara sembarangan karena dapat menyebabkan bot gagal membaca konfigurasi.

---

## 🔀 9Router Setup

**9Router** digunakan sebagai gateway multi-provider AI sehingga Bela dapat menggunakan berbagai provider/model AI dengan sistem fallback.

Provider yang didukung dapat mencakup:

```text
9Router
├── Cloudflare
├── OpenCode Free
├── Groq
├── MiMo Code Free
├── Gemini
├── Mistral
└── OpenRouter
```

Contoh model/provider yang dapat tersedia melalui konfigurasi 9Router:

```text
xAI (Grok)
├── Grok 3
├── Grok 4
├── Grok 4 Fast Reasoning
└── Grok Code Fast

MiMo Code Free
└── MiMo Auto

OpenCode Free
└── big-pickle custom

Cloudflare
├── Llama 3.3 70B Instruct FP8 Fast
├── DeepSeek R1 Distill Qwen 32B
├── GLM 4.7 Flash
├── Kimi K2.5
├── Kimi K2.6
├── Llama 3.1 70B Instruct FP8 Fast
├── Llama 3.1 8B Instruct AWQ
├── Llama 3.1 8B Instruct FP8 Fast
├── Llama 3.2 1B Instruct
├── Llama 3.2 3B Instruct
├── Mistral Small 3.1 24B Instruct
├── Qwen 2.5 Coder 32B Instruct
└── QwQ 32B

Gemini
├── Gemini 2.5 Flash
├── Gemini 2.5 Flash Lite
├── Gemini 2.5 Pro
├── Gemini 3 Flash Preview
├── Gemini 3.1 Flash Lite Preview
├── Gemini 3.1 Pro Preview
├── Gemini 3.5 Flash Lite
├── Gemini 3.6 Flash
├── Gemini 3.7 Flash
└── Gemma 4 31B IT

Groq
├── Llama 3.3 70B
├── GPT-OSS 120B
├── Llama 4 Maverick
└── Qwen3 32B

Mistral
├── Codestral
├── Mistral Large 3
└── Mistral Medium 3
```

### Fallback AI

Bela dapat menggunakan sistem fallback untuk berpindah ke provider/model lain apabila provider utama mengalami error, timeout, atau tidak tersedia.

Contoh alur:

```text
User
  │
  ▼
Bela
  │
  ▼
9Router
  │
  ├──► Provider Utama
  │
  ├──► Provider Fallback 1
  │
  ├──► Provider Fallback 2
  │
  └──► Provider Fallback 3
```

> **Catatan:** Model yang tersedia dapat berubah tergantung provider dan konfigurasi 9Router yang digunakan.

---

## 🎭 Mode Respons

### Auto

Bot otomatis merespons pesan sesuai konfigurasi.

```text
User → Pesan → Bela → AI Response
```

### Prefix

Bot hanya merespons ketika dipanggil atau memenuhi trigger yang ditentukan.

```text
User → Trigger/Prefix → Bela → AI Response
```

### Hybrid

Mode gabungan antara prefix dan auto response.

```text
User
 │
 ├── Ada trigger? ──► Response
 │
 └── Tidak ada ─────► Auto Response sesuai konfigurasi
```

---

## 🔐 Permission Level

Permission digunakan untuk mengatur tingkat akses fitur bot.

| Level | Akses                                         |
| ----: | --------------------------------------------- |
|   `0` | Fitur dasar                                   |
|   `1` | Fitur tambahan sesuai konfigurasi grup        |
|   `2` | Fitur moderasi/admin                          |
|   `3` | Akses tingkat tinggi/owner sesuai konfigurasi |

Contoh:

```text
/permission 0
/permission 1
/permission 2
/permission 3
```

> Permission dapat berbeda penerapannya tergantung konfigurasi dan implementasi source code.

---

## ❓ FAQ

### Apakah Bela harus menggunakan slash command?

Tidak. Bela dirancang untuk memahami bahasa natural dan dapat merespons percakapan tanpa harus menggunakan slash command.

### Apakah Bela bisa digunakan di grup?

Ya. Bela memiliki fitur group management dan mode respons yang dapat dikonfigurasi.

### Apakah Bela mendukung AI provider berbeda?

Ya. Bela mendukung multi-provider AI melalui 9Router dengan sistem fallback.

### Apakah memory dapat disimpan?

Ya. Bela mempunyai sistem memory global dan per-chat.

### Apakah semua command dapat digunakan semua orang?

Tidak. Beberapa command hanya tersedia untuk admin grup atau owner.

### Apakah 9Router wajib?

Tidak. 9Router ditandai sebagai optional untuk penggunaan multi-provider AI.

### Versi Node.js berapa yang dibutuhkan?

Bela membutuhkan **Node.js 18 atau lebih baru**.

### Versi Python berapa yang dibutuhkan?

Bela membutuhkan **Python 3.10 atau lebih baru**.

---

## 📝 License

ISC © 2026 jhon338-jc

---

## 👥 Kontributor

| Nama                                         | Peran                                                                          |
| -------------------------------------------- | ------------------------------------------------------------------------------ |
| [@Chomosuke9](https://github.com/Chomosuke9) | **Original Creator** — pembuat awal Bot Bela V2                                |
| [@jhon338-jc](https://github.com/jhon338-jc) | **Maintainer & Developer** — full update, bug fix, dan pengembangan fitur baru |

### Credit & History

Project ini awalnya dibuat oleh [Chomosuke9](https://github.com/Chomosuke9) (Bagus Teguh Widoyoko). Kemudian di-fork, di-update penuh, dan dikembangkan lebih lanjut oleh [jhon338-jc](https://github.com/jhon338-jc) (JHON338) dengan penambahan fitur:

* RVO (View-Once)
* Group management lengkap (kick, add, pin, setpp, setname)
* PAP & Media system
* Bot on/off per chat
* 9Router multi-provider support
* Dan banyak lagi

---

## ⚠️ Disclaimer

Project ini dibuat untuk tujuan pembelajaran, eksperimen, dan pengembangan bot WhatsApp.

Gunakan bot secara bertanggung jawab dan pastikan penggunaan fitur, media downloader, AI provider, serta pengelolaan grup sesuai dengan aturan platform dan layanan yang digunakan.

Jangan membagikan:

* API key
* Access token
* Session WhatsApp
* Password
* Credential database
* File `.env`
* Data pribadi pengguna

ke repository publik.

---

## ⭐ Support Project

Jika project ini bermanfaat, kamu dapat memberikan ⭐ pada repository GitHub dan membantu pengembangan project lebih lanjut.

**BELA — WhatsApp AI Bot Indonesia 🤖💗**
