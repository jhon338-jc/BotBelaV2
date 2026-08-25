Oke, ini README.md yang udah gue update dengan **cara setup lengkap**:

```markdown
# 🤖 Bot Bela V2

[![Node 18+](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org/)
[![Python 3.10+](https://img.shields.io/badge/python-%3E%3D3.10-blue)](https://python.org/)
[![License](https://img.shields.io/badge/license-ISC-lightgrey)](./package.json)
[![GitHub stars](https://img.shields.io/github/stars/jhon338-jc/BotBelaV2?style=social)](https://github.com/jhon338-jc/BotBelaV2)

**BELA V2** — WhatsApp AI bot cewek Indonesia yang imut, gemes, gaul, dan punya kepribadian nyata. Dia bisa ngobrol natural, nyimpen memory, bikin stiker, download video, manage grup, RVO view-once, dan masih banyak lagi — semua TANPA harus pake slash command!

---

## 📑 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Semua Command](#-semua-command)
- [Cara Install](#-cara-install)
- [Cara Setup Bot](#-cara-setup-bot)
- [Cara Setup 9Router](#-cara-setup-9router)
- [Cara Pairing WhatsApp](#-cara-pairing-whatsapp)
- [Cara Ganti Owner](#-cara-ganti-owner)
- [Cara Ganti Model AI](#-cara-ganti-model-ai)
- [Cara Bot On/Off Per Chat](#-cara-bot-onoff-per-chat)
- [Konfigurasi](#-konfigurasi)
- [Mode Respons](#-mode-respons)
- [Permission Level](#-permission-level)
- [FAQ](#-faq)
- [License](#-license)
- [Kontributor](#-kontributor)

---

## ✨ Fitur Utama

### 🎭 AI Kepribadian
- Cewek Indonesia umur 18 tahun yang manis, lembut, imut, dan gemes
- Bisa basa-basi, grogi, malu-malu, baper, excited, moody
- Paham bahasa natural — tanpa slash command
- Auto-save memory — ingat user selamanya
- Paham semua variasi panggilan: Bel, Bell, Bela, Bella, Belll
- Ngobrol dewasa (18+) natural tanpa sensor
- Support multi-provider AI via 9Router (fallback otomatis)

### 📥 Download Video
- TikTok, YouTube, Instagram, Facebook
- Tinggal kirim link, bot langsung download

### 🎨 Stiker
- Stiker dari gambar/video (`/sticker`)
- Stiker Brat dari teks (`/stikerteks`)
- Katalog stiker custom (`/add-sticker`, `/remove-sticker`)

### 🔓 RVO (View-Once)
- Buka pesan view-once yang di-reply
- Support gambar, video, dan audio
- Bisa dipake semua orang

### 🛡️ Group Management
- Kick / Add / Mute / Delete / Pin
- Ganti nama grup, PP grup, deskripsi grup
- Ambil link invite grup
- Tutup / buka grup
- Permission level (0-3)

### 🧠 Memory System
- Auto-save fakta user
- Memory global & per-chat
- Lihat/hapus memory

### ⏰ Scheduling
- Jadwalkan tugas (`/schedule-task`)
- Tugas harian (`/daily-task`)
- Idle trigger (`/idle`)

### 🖼️ PAP & Media
- PAP random (`/pap`)
- PAP memek (`/papmmk`) — owner only
- PAP susu (`/paptt`) — owner only
- PAP bugil (`/papbugil`) — owner only

### 👑 Owner Features
- Broadcast, config, generate, revoke, join, monitor
- Bot on/off per chat (`/boton`, `/botoff`)
- Model config, memory, subagent, update

---

## 📋 Semua Command

### 🟢 Public (Semua Orang)

| Command | Deskripsi |
|---------|-----------|
| `/menubela` | Menu fitur utama |
| `/download <link>` | Download video |
| `/sticker` | Stiker dari gambar (reply) |
| `/stikerteks <teks>` | Stiker Brat dari teks |
| `/rvo` | Buka view-once (reply) |
| `/pap` | PAP random |
| `/grouplink` | Ambil link grup |
| `/iqc <nama>` | Cek IQ random |
| `/schedule-task` | Jadwalkan tugas |
| `/daily-task` | Tugas harian |

### 🛡️ Admin Grup

| Command | Deskripsi |
|---------|-----------|
| `/group kick` | Kick member |
| `/group add` | Tambah member |
| `/group mute` | Mute member |
| `/group delete` | Hapus pesan (reply) |
| `/group pin` | Pin pesan (reply) |
| `/group close/open` | Tutup/buka grup |
| `/group description` | Ubah deskripsi |
| `/permission` | Level moderasi |
| `/trigger` | Atur trigger |
| `/idle` | Idle trigger |
| `/mode` | Mode respons |
| `/announcement` | Broadcast setting |
| `/prompt` | Atur system prompt |
| `/setnamegroup` | Ganti nama grup |
| `/setpp` | Ganti PP grup |
| `/add-sticker` | Tambah stiker |
| `/remove-sticker` | Hapus stiker |
| `/setting` | Menu pengaturan |
| `/compat` | Mode pesan interaktif |

### 👑 Owner Only

| Command | Deskripsi |
|---------|-----------|
| `/boton` | Aktifkan bot |
| `/botoff` | Matikan bot |
| `/broadcast` | Broadcast semua grup |
| `/bot-conf` | Config global |
| `/join` | Join grup |
| `/generate` | Generate kode aktivasi |
| `/revoke` | Cabut kode |
| `/monitor` | Dashboard bot |
| `/model` | Atur model |
| `/modelcfg` | Config model |
| `/memory` | Lihat memory |
| `/subagent` | Sub-agent |
| `/kirim-media` | PAP & media |
| `/papmmk` | PAP memek |
| `/paptt` | PAP susu |
| `/papbugil` | PAP bugil |
| `/help` | List command |
| `/info` | Info bot |
| `/dump` | Ekspor LLM |
| `/debug` | Debug |
| `/catch` | Debug payload |
| `/lid` | Liat LID |
| `/owner-contact` | Kontak owner |
| `/reset` | Reset chat |
| `/update` | Update bot |

---

## 🚀 Cara Install

### Requirements
- **Node.js 18+** → [Download](https://nodejs.org/)
- **Python 3.10+** → [Download](https://python.org/)
- **Git** → [Download](https://git-scm.com/)

### Step 1: Clone repo
```bash
git clone https://github.com/jhon338-jc/BotBelaV2.git
cd BotBelaV2
```

### Step 2: Install Node.js dependencies
```bash
npm install
```

### Step 3: Install Python dependencies
```bash
cd python
pip install -r requirements.txt
cd ..
```

### Step 4: Setup .env
```bash
copy .env.example .env
notepad .env
```

---

## 🔧 Cara Setup Bot

### 1. Edit file `.env`

```bash
notepad .env
```

### 2. Isi konfigurasi wajib:

```
BOT_OWNER_JIDS=628xxx,628xxx
WA_PAIRING_NUMBER=628xxx
```

**Contoh:**
```
BOT_OWNER_JIDS=6285134895788,6285602288269
WA_PAIRING_NUMBER=6285602288269
```

### 3. Simpan file `.env`

### 4. Jalankan Node.js (Terminal 1)
```bash
npm start
```

### 5. Jalankan Python bridge (Terminal 2)
```bash
cd python
python -m bridge.main
```

---

## 🔀 Cara Setup 9Router

### 1. Jalankan 9Router
```bash
npx 9router
```

### 2. Buka dashboard
```
http://localhost:20128
```

### 3. Tambah API key provider
- Masuk ke **Providers**
- Klik provider yang lo punya (Gemini, Cloudflare, Groq, dll)
- Tambah API key

### 4. Bikin combo `BELA_UTAMA`
- Masuk ke **Combo & Vision Adapter**
- Klik **New Combo**
- Nama: `BELA_UTAMA`
- Tambah model yang aktif

### 5. Model yang direkomendasikan:

1. `gemini/gemini-3.6-flash` ← paling stabil
2. `gemini/gemini-3-flash-preview`
3. `cf/@cf/meta/llama-3.3-70b-instruct-fp8-fast`
4. `cf/@cf/meta/llama-3.1-70b-instruct-fp8-fast`
5. `cf/@cf/mistralai/mistral-small-3.1-24b-instruct`
6. `mistral/mistral-large-latest`
7. `oc/big-pickle`

---

## 📱 Cara Pairing WhatsApp

### 1. Buka WhatsApp di HP

### 2. Masuk ke **Linked Devices** → **Link a Device**

### 3. Pilih **Link with phone number**

### 4. Masukin nomor yang di-set di `WA_PAIRING_NUMBER`

### 5. Masukin kode pairing dari terminal

### 6. Done! Bot udah konek.

---

## 👑 Cara Ganti Owner

### 1. Edit `.env`
```bash
notepad .env
```

### 2. Cari `BOT_OWNER_JIDS`

### 3. Ganti nomor owner:
```
BOT_OWNER_JIDS=628_nomor_owner_1,628_nomor_owner_2
```

### 4. Simpan & restart Node.js

---

## 🤖 Cara Ganti Model AI

### Dari WhatsApp grup:
```
/model BELA_UTAMA
```

### Atau dari 9Router:
1. Buka `http://localhost:20128`
2. **Combo & Vision Adapter**
3. Edit `BELA_UTAMA`
4. Tambah/hapus model

---

## 🔌 Cara Bot On/Off Per Chat

### Aktifkan bot di grup:
```
/boton
```

### Matikan bot di grup:
```
/botoff
```

**Saat `/boton`:**
- Bot aktif
- Model otomatis ke `BELA_UTAMA`
- Semua fitur jalan

**Saat `/botoff`:**
- Bot mati
- Fitur slash mati
- Tapi AI masih bisa chat natural

---

## ⚙️ Konfigurasi

| Variable | Default | Deskripsi |
|----------|---------|-----------|
| `BOT_OWNER_JIDS` | - | Nomor owner |
| `WA_PAIRING_NUMBER` | - | Nomor bot |
| `ASSISTANT_NAME` | `bela,bell,bella,belll` | Nama panggilan |
| `LLM1_MODEL` | `BELA_UTAMA` | Model LLM1 |
| `LLM2_MODEL` | `BELA_UTAMA` | Model LLM2 |
| `LLM2_ENDPOINT` | `http://localhost:20128/v1` | Endpoint LLM2 |
| `LLM2_TIMEOUT` | `120` | Timeout LLM2 |
| `HISTORY_LIMIT` | `50` | Pesan diingat |
| `PRIVATE_CHAT_ENABLED` | `false` | Bot respon DM |

---

## 🎭 Mode Respons

```bash
/mode auto      # Bot respond semua pesan
/mode prefix    # Bot respond saat disebut
/mode hybrid    # Prefix dulu, auto kalau nggak ada
```

---

## 🔐 Permission Level

| Level | Delete | Mute | Kick |
|-------|--------|------|------|
| 0 | ❌ | ❌ | ❌ |
| 1 | ✅ | ❌ | ❌ |
| 2 | ✅ | ✅ | ❌ |
| 3 | ✅ | ✅ | ✅ |

```bash
/permission 3
```

---

## ❓ FAQ

**Bot nggak bales di grup?**
- Cek mode (`/mode auto`)
- Cek bot enabled (`/boton`)

**LLM timeout?**
- Naikin `LLM2_TIMEOUT=180`
- Hapus model mati dari combo

**Bot nggak bisa kick?**
- Cek permission (`/permission 3`)
- Cek bot admin di grup

**PAP nggak bisa diakses?**
- Cek user-nya owner atau bukan

---

## 📝 License

ISC © 2026 jhon338-jc

---

## 👥 Kontributor

| Nama | Peran |
|------|-------|
| [@Chomosuke9](https://github.com/Chomosuke9) | **Original Creator** |
| [@jhon338-jc](https://github.com/jhon338-jc) | **Maintainer & Developer** |

Project ini awalnya dibuat oleh Chomosuke9, dikembangkan & di-update penuh oleh JHON338 dengan penambahan fitur:
- RVO (View-Once)
- Group management lengkap
- PAP & Media system
- Bot on/off per chat
- 9Router multi-provider
- Owner detection fromMe
- Anti tool_call injection
- Model protection
- Dan banyak lagi

---

**BELA V2 — WhatsApp AI Bot Indonesia by JHON338 🤖💗**
```

---

**Buka `README.md`, Ctrl+A, Delete, paste full code, Ctrl+S.**

**Push:**
```bash
git add README.md
git commit -m "Update README: full setup guide Bela V2"
git push origin main
```

🔥