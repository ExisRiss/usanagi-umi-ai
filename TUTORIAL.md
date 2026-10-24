# TUTORIAL — dari nol sampai bot online

Panduan lengkap, Bahasa Indonesia. Semua perintah dijalankan di terminal Linux
(di Windows pakai WSL atau Git Bash).

- [0. Gambaran besar](#0-gambaran-besar)
- [1. Persyaratan](#1-persyaratan)
- [2. Ambil kode](#2-ambil-kode)
- [3. Install dependency](#3-install-dependency)
- [4. Isi config.js](#4-isi-configjs)
- [5. Isi .platform.env (rahasia)](#5-isi-platformenv-rahasia)
- [6. Jalankan bot](#6-jalankan-bot)
- [7. Pairing (hubungkan nomor WhatsApp)](#7-pairing-hubungkan-nomor-whatsapp)
- [8. Cek bot sudah jalan](#8-cek-bot-sudah-jalan)
- [9. Website jadibot di Vercel](#9-website-jadibot-di-vercel)
- [10. Server game (multiplayer, trading, RPG)](#10-server-game-multiplayer-trading-rpg)
- [11. Deploy di panel Pterodactyl](#11-deploy-di-panel-pterodactyl)
- [12. Akses publik dengan Cloudflare Tunnel](#12-akses-publik-dengan-cloudflare-tunnel)
- [13. Backup otomatis + Telegram](#13-backup-otomatis--telegram)
- [14. Perintah penting bot](#14-perintah-penting-bot)
- [15. Troubleshooting](#15-troubleshooting)
- [16. Daftar rahasia yang wajib kamu isi sendiri](#16-daftar-rahasia-yang-wajib-kamu-isi-sendiri)

---

## 0. Gambaran besar

Ada tiga bagian yang bisa jalan sendiri-sendiri:

```
┌──────────────┐        ┌──────────────────┐        ┌────────────────┐
│  bot/        │◄──────►│  website/        │◄──────►│  Supabase      │
│  WhatsApp    │  API   │  Vercel (studio) │  data  │  (auth + DB)   │
└──────┬───────┘        └──────────────────┘        └────────────────┘
       │
       │ HTTP (token)
       ▼
┌──────────────┐
│  db-mirror/  │  server game web: multiplayer, trading, empire
└──────────────┘
```

- **bot** harus jalan supaya WhatsApp hidup.
- **website** boleh tidak ada kalau kamu tidak butuh jualan jadibot.
- **db-mirror** opsional; tanpa ini, fitur game web & trading mati, fitur chat tetap jalan.

---

## 1. Persyaratan

| Kebutuhan | Versi | Catatan |
|---|---|---|
| Node.js | 20+ (disarankan 22/23) | `node -v` |
| npm | ikut Node | `npm -v` |
| RAM | 1 GB minimum | 2 GB lebih nyaman |
| Disk | ±2 GB | `node_modules` besar |
| ffmpeg | opsional | untuk audio/video |
| Git | opsional | kalau clone |

Pasang Node 22 di Ubuntu/Debian:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs ffmpeg
node -v
```

---

## 2. Ambil kode

```bash
git clone https://github.com/<user>/<repo>.git
cd <repo>
```

Atau unduh ZIP dari GitHub lalu ekstrak.

Struktur yang kamu punya setelah ini:

```
repo/
├── bot/          ← jalankan bot dari sini
├── website/      ← deploy ke Vercel
├── db-mirror/    ← server game
├── standalone/   ← RPG mandiri
├── deploy/       ← contoh systemd/nginx/docker
└── TUTORIAL.md
```

---

## 3. Install dependency

```bash
cd bot
npm install
```

Butuh 3–10 menit tergantung koneksi. Kalau `better-sqlite3` atau `canvas` gagal
dikompilasi:

```bash
sudo apt install -y build-essential python3
npm install
```

Kalau panel hosting memblokir lifecycle script (pesan "allow-scripts"), jalankan
`npm install --ignore-scripts` lalu `node scripts/boot.js` sekali — skrip boot
memperbaiki modul native yang terlewat.

---

## 4. Isi config.js

```bash
cp config.example.js config.js
nano config.js
```

Yang **wajib** diubah:

```js
global.owner = [
  ['6281234567890', 'Nama Kamu', true],   // nomor WhatsApp kamu, format 62...
]

global.namebot = 'Usanagi Umi'            // nama bot
global.mainBot = {
  defaultPrefix: '.',                     // awalan perintah
  registrationRequired: true,
}
```

Kalau memakai website jadibot, isi juga:

```js
global.jadibotPlatform = {
  enabled: true,
  apiPort: 3854,                          // port API internal
  supabaseUrl: 'https://xxxx.supabase.co',
  supabaseAnonKey: 'eyJ...',              // anon key (aman dipakai di klien)
  ownerEmails: ['email-kamu@gmail.com'],
  lockedOwnerNumber: '6281234567890',
}
```

> Nomor `global.owner` adalah nomor yang boleh memakai perintah owner.
> `true` di elemen ketiga = owner penuh.

---

## 5. Isi .platform.env (rahasia)

Berkas ini **tidak ada** di repo (sengaja). Buat sendiri:

```bash
nano .platform.env
chmod 600 .platform.env
```

Isi minimal supaya aman:

```ini
# --- wajib kalau pakai website ---
PLATFORM_SECRET_KEY=            # 32 byte acak, base64
PLATFORM_API_SECRET=            # rahasia bersama website <-> bot
PLATFORM_MEDIA_SIGNING_KEY=     # kunci HMAC untuk URL media
PLATFORM_PUBLIC_BASE_URL=https://api.domainmu.com
PLATFORM_WEB_URL=https://domainmu.vercel.app

# --- Supabase (database + auth website) ---
UMI_DATA_SUPABASE_URL=https://xxxx.supabase.co
UMI_DATA_SERVICE_ROLE_KEY=      # service role, JANGAN bocor
UMI_DATA_ANON_KEY=              # anon key

# --- Telegram (opsional) ---
TELEGRAM_BOT_TOKEN=             # dari @BotFather
TELEGRAM_OWNER_IDS=             # id numerik kamu
TELEGRAM_BACKUP_CHAT_ID=        # -100... grup tujuan backup

# --- AI (opsional) ---
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.0-flash
```

Buat nilai acak:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Berkas `.platform.env` dibaca otomatis oleh `lib/platform/env.js` — nilai yang
sudah ada di environment sistem tidak akan ditimpa.

---

## 6. Jalankan bot

```bash
node main.js
```

Atau lewat wrapper yang memperbaiki modul native & membersihkan temp:

```bash
node scripts/boot.js
```

Log yang menandakan sukses:

```
Config loaded
Successfully Loaded 2000+ Plugins
[JADIBOT-API] Aktif di 0.0.0.0:3854
Bot siap digunakan!
```

Biarkan proses ini jalan. Untuk produksi pakai `pm2`, `systemd`, atau panel
(lihat [bagian 11](#11-deploy-di-panel-pterodactyl)).

---

## 7. Pairing (hubungkan nomor WhatsApp)

Saat pertama jalan dan belum ada sesi, bot meminta pairing:

**Cara 1 — kode pairing (disarankan)**

1. Kirim perintah ke bot lewat website / console panel:
   ```
   pairing-request
   ```
   atau dari WhatsApp nomor lain ke nomor bot (kalau bot sudah terhubung).
2. Bot menampilkan kode 8 karakter, mis. `ABCD-EFGH`.
3. Di HP: **WhatsApp → Pengaturan → Perangkat tertaut → Tautkan perangkat →
   Tautkan dengan nomor telepon** → masukkan kode.

**Cara 2 — QR**

Jalankan bot, lalu scan QR yang muncul di terminal.

> Kode pairing hanya hidup ±60 detik. Kalau gagal, minta ulang.

Setelah berhasil, folder `sessions/` berisi `creds.json`. **Jangan bagikan folder ini.**

---

## 8. Cek bot sudah jalan

Kirim pesan ke nomor bot dari nomor lain:

```
.menu
```

Kalau dibalas menu, bot sudah hidup.

Perintah dasar:

| Perintah | Fungsi |
|---|---|
| `.menu` | menu utama |
| `.ping` | cek kecepatan |
| `.daftar` | registrasi pengguna |
| `.owner` | kontak owner |
| `.jadibot` | info menyambungkan nomor sendiri |
| `.backup` | backup manual |

---

## 9. Website jadibot di Vercel

Website butuh **Supabase** (auth + database) dan **Vercel** (hosting).

### 9.1 Supabase

1. Buat project di <https://supabase.com>.
2. Buka **SQL Editor**, jalankan isi `website/supabase-platform.sql`.
3. Catat: `Project URL`, `anon key`, `service_role key`.

### 9.2 Vercel

```bash
npm i -g vercel
cd website
vercel link          # hubungkan ke project
```

Atau import repo lewat dashboard Vercel, **Root Directory = `website`**.

### 9.3 Environment Variables di Vercel

Setel di **Project → Settings → Environment Variables**:

| Variabel | Nilai |
|---|---|
| `UMI_API_ORIGIN` | alamat publik bot, mis. `https://api.domainmu.com` |
| `UMI_ALLOWED_ORIGINS` | domain website, mis. `https://domainmu.vercel.app` |
| `UMI_DATA_SUPABASE_URL` | `https://xxxx.supabase.co` |
| `UMI_DATA_SERVICE_ROLE_KEY` | service role key |
| `SUPABASE_ANON_KEY` | anon key |
| `PLATFORM_API_SECRET` | **sama persis** dengan yang di `.platform.env` bot |
| `UMI_CONSOLE_RELAY_SECRET` | rahasia relay owner-console (sama dengan bot) |
| `BACKUP_ADMIN_SECRET` | rahasia halaman backup |
| `BACKUP_CRON_SECRET` | rahasia cron backup |

`PLATFORM_API_SECRET` dan `UMI_CONSOLE_RELAY_SECRET` **harus identik** di kedua sisi,
kalau tidak website akan ditolak bot (401/503).

### 9.4 Deploy

```bash
cd website
vercel --prod
```

Cek:

```bash
curl https://domainmu.vercel.app/api/v1/health
# {"ok":true,"service":"Jadibot Unified API",...}
```

### 9.5 Catatan port

`global.jadibotPlatform.apiPort` harus sama dengan port yang diteruskan tunnel /
reverse proxy ke bot. Kalau tunnel meneruskan ke `localhost:2176`, set `apiPort: 2176`.

---

## 10. Server game (multiplayer, trading, RPG)

`db-mirror/` adalah satu proses Node tanpa dependency: game room, halaman trading,
empire, dan proxy ke RPG bot.

```bash
cd db-mirror
node game.js          # default port 3900
```

Cek:

```bash
curl http://127.0.0.1:3900/health
# {"ok":true,"service":"umi-web-games","games":["uno","chess",...]}
```

Supaya bot bisa membuat akun trading otomatis, buat `bot/lib/webgame.json`:

```json
{
  "enabled": true,
  "baseUrl": "https://game.domainmu.com",
  "token": "TOKEN-PANJANG-ACAK"
}
```

Token yang sama harus ada di server game, mis. berkas `game-token.txt`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))" > game-token.txt
chmod 600 game-token.txt
```

Kalau game dan bot di **server berbeda**, arahkan proxy RPG ke bot:

```bash
# .game.env di server game
UMI_REALMS_BOT_ORIGIN=https://api.domainmu.com
UMI_REALMS_PUBLIC_HOST=game.domainmu.com
UMI_GAME_TOKEN=<token yang sama>
```

---

## 11. Deploy di panel Pterodactyl

Cocok kalau tidak mau mengurus VPS sendiri.

1. **Buat server** dengan egg **Node.js** (Node 20/22/23), bukan egg kosong.
2. **Upload** isi folder `bot/` ke `/home/container` (SFTP atau File Manager → unggah ZIP lalu ekstrak).
3. **Startup command**: `npm start` (memanggil `scripts/boot.js`).
4. **Variabel startup** yang perlu diisi:
   - `CMD_RUN` = `npm start`
   - `GIT_ADDRESS` (opsional, untuk auto-pull)
   - `BRANCH` = `main`
5. **Mulai server**, lalu isi `config.js` dan `.platform.env` lewat File Manager.
6. Restart.

Untuk server game, buat server kedua, upload isi `db-mirror/`, dan set
`CMD_RUN = node game.js`.

> Panel kadang menampilkan status "starting" walaupun proses sudah jalan.
> Cek lewat endpoint `/api/health` atau console.

---

## 12. Akses publik dengan Cloudflare Tunnel

Bot & game biasanya ada di balik NAT/panel. Tunnel membuatnya bisa diakses HTTPS
tanpa membuka port.

```bash
# 1. unduh cloudflared
curl -sSL -o cloudflared \
  https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
chmod +x cloudflared

# 2. buat tunnel di dashboard Cloudflare (Zero Trust → Tunnels)
#    salin token yang diberikan, lalu:
chmod 600 .tunnel.env
echo 'CLOUDFLARE_TUNNEL_TOKEN=<token>' > .tunnel.env

# 3. jalankan
./cloudflared tunnel --no-autoupdate run --token "$(cut -d= -f2 .tunnel.env)"
```

Atur **Public Hostname** di dashboard:

| Hostname | Service |
|---|---|
| `api.domainmu.com` | `http://localhost:3854` (port API bot) |
| `game.domainmu.com` | `http://localhost:3900` (server game) |

Untuk menjalankan tunnel + bot sekaligus:

```bash
npm run tunnel-start
```

---

## 13. Backup otomatis + Telegram

### 13.1 Backup harian bawaan

Diatur `lib/auto-backup.js`. Default:

- jalan tiap hari **00:00 WITA**, retensi 2 generasi
- hasil di `data/auto-backups/usanagi-full-backup-YYYYMMDD-HHMM-part-XX-of-YY.zip`
- dikirim ke grup Telegram kalau `TELEGRAM_BACKUP_CHAT_ID` diisi
- **tidak jalan** kalau sisa disk < 3 GB

Ubah lewat `config.js`:

```js
global.autoBackup = {
  hour: 0, minute: 0,
  keepGenerations: 3,
  retentionDays: 7,
}
```

### 13.2 Supaya terkirim ke Telegram

1. Buat bot di [@BotFather](https://t.me/BotFather), salin token ke `TELEGRAM_BOT_TOKEN`.
2. Buat grup, tambahkan bot sebagai **admin**.
3. Ambil ID grup (`-100...`) — kirim pesan di grup, buka
   `https://api.telegram.org/bot<TOKEN>/getUpdates`, lihat `chat.id`.
4. Isi `TELEGRAM_BACKUP_CHAT_ID`.

### 13.3 Backup manual

```
.backup
```
atau dari website: halaman **Backup** → tombol **Buat Backup**.

> **Penting:** folder `sessions/` berisi kredensial WhatsApp. Simpan arsip backup
> di tempat yang aman — jangan di repo publik.

---

## 14. Perintah penting bot

| Kategori | Contoh |
|---|---|
| Utama | `.menu`, `.ping`, `.owner`, `.sewa`, `.donasi` |
| Owner | `.addowner`, `.delowner`, `.setprefix`, `.restart`, `.backup` |
| Grup | `.antilink`, `.antispam`, `.tagall`, `.hidetag`, `.group buka/tutup` |
| AI | `.ai <tanya>`, `.gpt`, `.gemini`, `.img <prompt>` |
| Download | `.ytmp3`, `.ytmp4`, `.tiktok`, `.instagram`, `.spotify` |
| Game | `.uno`, `.catur`, `.ular`, `.monopoli`, `.werewolf`, `.empire` |
| RPG | `.rpg`, `.petualang`, `.dagang` |
| Trading | `.trading`, `.saham`, `.beli`, `.jual` |
| Ekonomi | `.daily`, `.limit`, `.koin`, `.level`, `.profile` |

Daftar lengkap: `.menu all` atau lihat `bot/plugins/` dan `bot/integrations/`.
Kalau nama perintah bentrok, versi integrasi memakai awalan `.usanagi-<perintah>`.

---

## 15. Troubleshooting

| Gejala | Penyebab & solusi |
|---|---|
| `Cannot find module 'x'` | `npm install` belum selesai / paket native gagal kompilasi → pasang `build-essential python3`, ulangi |
| `ENOSPC` saat mengirim media | `/tmp` penuh → jalankan lewat `scripts/boot.js` (mengarahkan temp ke folder container), hapus backup lama |
| Bot minta pairing terus | Sesi rusak. Hapus folder `sessions/` lalu pairing ulang |
| `Connection Terminated` | Nomor dipakai di HP lain, atau sesi dicabut. Pairing ulang |
| `/api/health` 502/530 | Bot mati, atau tunnel mati. Cek proses bot & `cloudflared` |
| Website balas 401 terus | `PLATFORM_API_SECRET` beda antara Vercel dan bot |
| Website balas 503 "Relay console owner belum dikonfigurasi" | `UMI_CONSOLE_RELAY_SECRET` belum ada di sisi bot (`.owner-console-relay.env` atau `.platform.env`) |
| `FUNCTION_INVOCATION_FAILED` di Vercel | Ada error yang lolos dari handler. Cek log fungsi di dashboard Vercel |
| Downloader YouTube gagal | IP server diblokir YouTube. Perlu cookies (`data/cookies.txt`) atau proxy |
| Plugin tidak muncul di menu | Nama berkas harus unik; cek log `Successfully Loaded N Plugins` |
| Game trading mati | `bot/lib/webgame.json` belum ada / token beda dengan `game-token.txt` |

Cek log:

```bash
# console bot
tail -f data/console.log

# error terstruktur
ls data/errors/
cat data/errors/$(date +%F).jsonl
```

---

## 16. Daftar rahasia yang wajib kamu isi sendiri

Repo ini sengaja **tidak** memuat satu pun nilai di bawah. Semua sudah diganti
placeholder.

| Berkas | Variabel |
|---|---|
| `bot/config.js` | `global.owner`, `jadibotPlatform.supabaseUrl/AnonKey` |
| `bot/.platform.env` | `PLATFORM_SECRET_KEY`, `PLATFORM_API_SECRET`, `PLATFORM_MEDIA_SIGNING_KEY`, `UMI_DATA_SUPABASE_URL`, `UMI_DATA_SERVICE_ROLE_KEY`, `UMI_DATA_ANON_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_OWNER_IDS`, `TELEGRAM_BACKUP_CHAT_ID`, `GEMINI_API_KEY`, `UMI_CONSOLE_RELAY_SECRET`, `UMI_ERROR_REPORT_SECRET`, `BACKUP_CRON_SECRET`, `BOT_BACKUP_EXPORT_SECRET`, `UMI_UPLOAD_API_TOKEN`, `BLOB_READ_WRITE_TOKEN`, `OWNER_PASSWORD`, `AUTH_SECRET` |
| `bot/.tunnel.env` | `CLOUDFLARE_TUNNEL_TOKEN` |
| `bot/lib/webgame.json` | `token` (harus sama dengan `game-token.txt` di server game) |
| Vercel | daftar di [bagian 9.3](#93-environment-variables-di-vercel) |

Cara cepat membuat rahasia acak:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Penutup

Urutan yang disarankan untuk pertama kali:

1. Bot jalan & pairing berhasil (bagian 2–8).
2. Tambah backup Telegram (bagian 13).
3. Baru pasang website (bagian 9) dan game (bagian 10).
4. Terakhir akses publik via tunnel (bagian 12) dan deploy permanen (bagian 11).

Kalau ada langkah yang gagal, cek [Troubleshooting](#15-troubleshooting) dulu —
sebagian besar masalah berasal dari 4 hal: `npm install` belum lengkap, sesi
WhatsApp rusak, rahasia tidak cocok antar-sisi, atau disk penuh.
