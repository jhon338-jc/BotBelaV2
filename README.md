# 🤖 Bot Bela V2

[![Node 18+](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org/)
[![Python 3.10+](https://img.shields.io/badge/python-%3E%3D3.10-blue)](https://python.org/)
[![License](https://img.shields.io/badge/license-ISC-lightgrey)](./package.json)
[![GitHub stars](https://img.shields.io/github/stars/jhon338-jc/BotBelaV2?style=social)](https://github.com/jhon338-jc/BotBelaV2)

**BELA V2** — WhatsApp AI bot cewek Indonesia yang imut, gemes, gaul, dan punya kepribadian nyata.

Bela bisa ngobrol natural, menyimpan memory, membuat stiker, download video, mengelola grup, membaca view-once, scheduling, dan masih banyak lagi.

> 💗 **Bela bukan sekadar bot biasa.**  
> Bela memiliki sistem personality, memory, multi-provider AI, group management, media system, dan berbagai fitur otomatis.

---

## 📑 Daftar Isi

- [✨ Fitur Utama](#-fitur-utama)
- [📋 Semua Command](#-semua-command)
- [🚀 Cara Install](#-cara-install)
- [⚙️ Konfigurasi](#️-konfigurasi)
- [🔀 9Router Setup](#-9router-setup)
- [🎭 Mode Respons](#-mode-respons)
- [🔐 Permission Level](#-permission-level)
- [❓ FAQ](#-faq)
- [📝 License](#-license)
- [👥 Kontributor](#-kontributor)
- [⚠️ Disclaimer](#️-disclaimer)

---

# ✨ Fitur Utama

## 🎭 AI Personality

- Cewek Indonesia umur 18 tahun
- Manis, lembut, imut, dan gemes
- Bisa basa-basi
- Bisa grogi dan malu-malu
- Bisa baper
- Bisa excited
- Bisa moody
- Memahami bahasa natural
- Tidak harus menggunakan slash command
- Auto-save memory
- Support berbagai panggilan seperti:
  - Bela
  - Bel
  - Bell
  - Bella
  - Belll
  - Ayang Bela
- Support percakapan 18+
- Multi-provider AI melalui 9Router
- Automatic fallback provider
- Bahasa Indonesia santai dan natural

---

## 📥 Download Video

Support download dari berbagai platform:

- TikTok
- YouTube
- Instagram
- Facebook
- Platform lainnya

Cukup kirim link video dan bot akan memprosesnya.

---

## 🎨 Sticker System

Fitur sticker:

- Sticker dari gambar
- Sticker dari video
- Sticker Brat dari teks
- Katalog sticker custom
- Tambah sticker
- Hapus sticker

Contoh:

```text
/sticker
/stikerteks halo bela
/add-sticker nama
/remove-sticker nama
````

---

## 🔓 RVO — View Once

Bela memiliki fitur RVO untuk membuka pesan view-once yang direply.

Support:

* 🖼️ Gambar
* 🎥 Video
* 🎵 Audio
* 👥 Grup
* 💬 Private Chat

Command:

```text
/rvo
```

---

## 🛡️ Group Management

Bela dapat membantu administrasi grup:

* Kick member
* Add member
* Mute member
* Delete pesan
* Pin pesan
* Ganti nama grup
* Ganti foto grup
* Ganti deskripsi grup
* Ambil link invite
* Tutup grup
* Buka grup
* Permission level

Format nomor yang didukung:

```text
08xxxxxxxxxx
62xxxxxxxxxx
+62xxxxxxxxxx
```

---

## 🧠 Memory System

Bela memiliki sistem memory untuk menyimpan informasi pengguna.

Fitur:

* Memory user
* Auto-save informasi penting
* Memory per chat
* Global memory
* Melanjutkan percakapan tanpa kehilangan konteks
* Melihat memory
* Menghapus memory
* Global memory khusus owner

Command:

```text
/memory
/memory add <fakta>
/memory delete <index>
/memory global add
```

---

## ⏰ Scheduling

Bela mendukung penjadwalan tugas.

Contoh:

```text
/schedule-task 30M rapat
```

Daily task:

```text
/daily-task add 07:00 bangun
```

Hapus:

```text
/daily-task delete
```

Idle trigger:

```text
/idle 5-10
```

---

## 🖼️ PAP & Media

Fitur media:

```text
/pap
/media
/kirim-media
```

Fitur owner:

```text
/papmmk
/paptt
/papbugil
```

---

# 👑 Owner Features

Owner mempunyai akses ke berbagai fitur khusus:

```text
/broadcast
/bot-conf
/generate
/revoke
/join
/owner-contact
/setpp
/setnamegroup
/model
/modelcfg
/subagent
/update
/boton
/botoff
/monitor
```

---

# ⚙️ Mode Respons

Bela memiliki tiga mode respons:

| Mode     | Deskripsi                              |
| -------- | -------------------------------------- |
| `auto`   | Bot merespons semua pesan              |
| `prefix` | Bot merespons ketika disebut/ditrigger |
| `hybrid` | Prefix terlebih dahulu, kemudian auto  |

Contoh:

```text
/mode auto
```

```text
/mode prefix
```

```text
/mode hybrid
```

---

# 🔍 Info & Statistik

Command informasi:

```text
/iqc <nama>
/dashboard
/info
/menubela
/help
/dump
```

---

# 📋 Semua Command

## 🟢 Public

| Command                           | Deskripsi                      |
| --------------------------------- | ------------------------------ |
| `/menubela`                       | Menu fitur utama               |
| `/download <link>`                | Download video TikTok/YT/IG/FB |
| `/sticker`                        | Membuat sticker dari gambar    |
| `/stikerteks <teks>`              | Membuat sticker Brat           |
| `/rvo`                            | Membuka view-once              |
| `/pap`                            | PAP random                     |
| `/grouplink`                      | Mengambil link grup            |
| `/iqc <nama>`                     | Cek IQ random                  |
| `/schedule-task <durasi> <tugas>` | Menjadwalkan tugas             |
| `/daily-task`                     | Mengelola tugas harian         |

---

## 🛡️ Admin Grup

| Command                        | Deskripsi             |
| ------------------------------ | --------------------- |
| `/group kick @nama`            | Kick member           |
| `/group add @nomor`            | Tambah member         |
| `/group mute @nama <menit>`    | Mute member           |
| `/group delete`                | Hapus pesan           |
| `/group pin <1\|7\|30>`        | Pin pesan             |
| `/group close`                 | Menutup grup          |
| `/group open`                  | Membuka grup          |
| `/group description <teks>`    | Mengubah deskripsi    |
| `/permission <0-3>`            | Mengatur permission   |
| `/trigger <jenis> on/off`      | Mengatur trigger      |
| `/idle <n>`                    | Mengatur idle trigger |
| `/mode <auto\|prefix\|hybrid>` | Mode respons          |
| `/announcement <on\|off>`      | Announcement          |
| `/prompt <teks>`               | System prompt         |
| `/setnamegroup <nama>`         | Mengubah nama grup    |
| `/setpp`                       | Mengubah foto grup    |
| `/add-sticker <nama>`          | Menambah sticker      |
| `/remove-sticker <nama>`       | Menghapus sticker     |
| `/setting`                     | Pengaturan            |
| `/compat <mode>`               | Mode pesan interaktif |

---

# 👑 Owner Only

| Command                  | Deskripsi                 |
| ------------------------ | ------------------------- |
| `/boton`                 | Mengaktifkan bot          |
| `/botoff`                | Menonaktifkan bot         |
| `/broadcast <teks>`      | Broadcast semua grup      |
| `/bot-conf`              | Config global             |
| `/join <link>`           | Join grup                 |
| `/generate`              | Generate kode aktivasi    |
| `/revoke <id>`           | Revoke kode               |
| `/monitor`               | Dashboard bot             |
| `/model`                 | Mengatur model LLM        |
| `/modelcfg`              | Config model              |
| `/memory`                | Melihat memory            |
| `/memory add <fakta>`    | Menambahkan memory        |
| `/memory delete <index>` | Menghapus memory          |
| `/memory global add`     | Menambahkan global memory |
| `/subagent on/off`       | Sub-agent                 |
| `/kirim-media`           | PAP & media               |
| `/papmmk`                | PAP khusus owner          |
| `/paptt`                 | PAP khusus owner          |
| `/papbugil`              | PAP khusus owner          |
| `/help`                  | Semua command             |
| `/info`                  | Informasi bot             |
| `/dump`                  | Dump konteks LLM          |
| `/debug`                 | Debug bot                 |
| `/catch`                 | Debug payload             |
| `/lid <nomor>`           | Melihat LID               |
| `/owner-contact`         | Kontak owner              |
| `/reset`                 | Reset history             |
| `/update`                | Update bot                |

---

# 🚀 Cara Install

## Requirements

Pastikan sudah terinstall:

* Node.js 18+
* Python 3.10+
* Git
* 9Router — optional tetapi direkomendasikan

---

## 1. Clone Repository

```bash
git clone https://github.com/jhon338-jc/BotBelaV2.git
cd BotBelaV2
```

---

## 2. Install Node.js Dependencies

```bash
npm install
```

---

## 3. Install Python Dependencies

```bash
cd python
pip install -r requirements.txt
cd ..
```

---

## 4. Setup `.env`

### Windows

```bash
copy .env.example .env
notepad .env
```

### Linux / Termux

```bash
cp .env.example .env
nano .env
```

Isi konfigurasi minimal:

```env
BOT_OWNER_JIDS=628xxxxxxxxxx
WA_PAIRING_NUMBER=628xxxxxxxxxx
```

---

# 🔀 9Router Setup

Install 9Router:

```bash
npx 9router
```

Kemudian buka:

```text
http://localhost:20128
```

Tambahkan API key provider AI yang ingin digunakan.

Buat combo:

```text
BELA_UTAMA
```

---

## Provider yang Didukung

Bela dapat menggunakan beberapa provider melalui 9Router:

* Cloudflare
* Gemini
* Groq
* Mistral
* OpenRouter
* OpenCode Free

---

## Combo `BELA_UTAMA`

Contoh konfigurasi:

```text
1. gemini/gemini-3.6-flash
2. gemini/gemini-3-flash-preview
3. cf/@cf/meta/llama-3.3-70b-instruct-fp8-fast
4. cf/@cf/meta/llama-3.1-70b-instruct-fp8-fast
5. cf/@cf/mistralai/mistral-small-3.1-24b-instruct
6. mistral/mistral-large-latest
7. oc/big-pickle
```

Provider akan digunakan secara fallback apabila provider sebelumnya mengalami error.

---

# ▶️ Menjalankan Bot

## Terminal 1 — Node.js

```bash
npm start
```

---

## Terminal 2 — Python Bridge

```bash
cd python
python -m bridge.main
```

---

# 📱 Pairing WhatsApp

1. Buka WhatsApp di HP.
2. Masuk ke **Linked Devices**.
3. Pilih **Link a Device**.
4. Pilih **Link with phone number**.
5. Masukkan nomor yang terdapat pada:

```env
WA_PAIRING_NUMBER
```

6. Masukkan kode pairing yang diberikan terminal.

Jika berhasil, bot siap digunakan.

---

# ⚙️ Konfigurasi

| Variable               | Default                     | Deskripsi                         |
| ---------------------- | --------------------------- | --------------------------------- |
| `BOT_OWNER_JIDS`       | -                           | Nomor owner, pisahkan dengan koma |
| `WA_PAIRING_NUMBER`    | -                           | Nomor WhatsApp bot                |
| `ASSISTANT_NAME`       | `bela,bell,bella,belll`     | Nama panggilan bot                |
| `LLM1_MODEL`           | `BELA_UTAMA`                | Model LLM utama                   |
| `LLM2_MODEL`           | `BELA_UTAMA`                | Model LLM kedua                   |
| `LLM2_ENDPOINT`        | `http://localhost:20128/v1` | Endpoint LLM2                     |
| `LLM2_TIMEOUT`         | `120`                       | Timeout LLM dalam detik           |
| `HISTORY_LIMIT`        | `50`                        | Jumlah history                    |
| `PRIVATE_CHAT_ENABLED` | `false`                     | Mengaktifkan respon DM            |

Contoh:

```env
BOT_OWNER_JIDS=628xxxxxxxxxx
WA_PAIRING_NUMBER=628xxxxxxxxxx

ASSISTANT_NAME=bela,bell,bella,belll

LLM1_MODEL=BELA_UTAMA
LLM2_MODEL=BELA_UTAMA

LLM2_ENDPOINT=http://localhost:20128/v1
LLM2_TIMEOUT=120

HISTORY_LIMIT=50
PRIVATE_CHAT_ENABLED=false
```

---

# 🎭 Mode Respons

### Auto

```text
/mode auto
```

Bot merespons semua pesan.

### Prefix

```text
/mode prefix
```

Bot hanya merespons ketika dipanggil atau ditrigger.

### Hybrid

```text
/mode hybrid
```

Bot menggunakan prefix terlebih dahulu dan dapat menggunakan auto response sesuai konfigurasi.

---

# 🔐 Permission Level

Permission menentukan kemampuan bot dalam melakukan moderasi grup.

| Level | Delete | Mute | Kick |
| ----: | :----: | :--: | :--: |
|     0 |    ❌   |   ❌  |   ❌  |
|     1 |    ✅   |   ❌  |   ❌  |
|     2 |    ✅   |   ✅  |   ❌  |
|     3 |    ✅   |   ✅  |   ✅  |

Contoh:

```text
/permission 3
```

---

# ❓ FAQ

## Bot tidak membalas di grup

Cek:

```text
/mode auto
```

Kemudian pastikan bot aktif:

```text
/boton
```

Dan periksa permission grup.

---

## LLM Timeout

Coba tingkatkan:

```env
LLM2_TIMEOUT=180
```

Kemudian pastikan 9Router masih berjalan.

Periksa juga model yang digunakan di combo.

---

## Bot tidak bisa kick member

Pastikan:

```text
/permission 3
```

dan bot sudah menjadi admin grup.

---

## Bot tidak bisa download video

Periksa:

* Link masih valid
* Koneksi internet
* Platform masih didukung
* Dependency downloader sudah terinstall

---

# 🗂️ Struktur Project

Struktur utama project:

```text
BotBelaV2/
│
├── plugins/
│   ├── owner/
│   ├── group/
│   └── ...
│
├── python/
│   ├── bridge/
│   └── requirements.txt
│
├── .env
├── .env.example
├── package.json
├── README.md
└── ...
```

---

# 🔒 Security

**Jangan pernah upload credential ke repository publik.**

Jangan membagikan:

```text
.env
API KEY
ACCESS TOKEN
WHATSAPP SESSION
DATABASE CREDENTIAL
PASSWORD
PRIVATE KEY
DATA PRIBADI
```

Pastikan `.env` masuk ke `.gitignore`.

Contoh:

```gitignore
.env
.env.*
!.env.example

node_modules/
__pycache__/
*.log
sessions/
auth/
```

---

# 📝 License

```text
ISC © 2026 jhon338-jc
```

---

# 👥 Kontributor

| Nama                                         | Peran                                                                |
| -------------------------------------------- | -------------------------------------------------------------------- |
| [@Chomosuke9](https://github.com/Chomosuke9) | **Original Creator** — pembuat awal Bot Bela V2                      |
| [@jhon338-jc](https://github.com/jhon338-jc) | **Maintainer & Developer** — update, bug fix, dan pengembangan fitur |

---

# 📜 Credit & History

Project ini awalnya dibuat oleh:

**Chomosuke9 — Bagus Teguh Widoyoko**

Kemudian project di-fork dan dikembangkan lebih lanjut oleh:

**jhon338-jc — JHON338**

Pengembangan yang ditambahkan antara lain:

* RVO / View-Once
* Group management
* Kick member
* Add member
* Pin message
* Set PP
* Set nama grup
* PAP & Media system
* Bot on/off per chat
* 9Router multi-provider
* Owner detection
* Anti tool-call injection
* Model protection
* Memory system
* Scheduling
* Dan berbagai pengembangan lainnya

---

# ⚠️ Disclaimer

Project ini dibuat untuk:

* Pembelajaran
* Eksperimen
* Pengembangan bot WhatsApp
* Pengembangan AI assistant

Gunakan bot secara bertanggung jawab.

Pastikan penggunaan fitur bot, downloader, AI provider, media, dan group management sesuai dengan aturan platform dan layanan yang digunakan.

---

# ⭐ Support Project

Jika project ini bermanfaat, jangan lupa memberikan ⭐ pada repository GitHub:

```text
https://github.com/jhon338-jc/BotBelaV2
```

---

<div align="center">

# 🤖 BELA V2

### WhatsApp AI Bot Indonesia

**Developed & Maintained by JHON338**

💗 AI • Memory • Sticker • Downloader • Group Management • 9Router

</div>
```
