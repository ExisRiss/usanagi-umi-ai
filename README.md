# Usanagi Umi AI

Bot WhatsApp multi-device (Baileys, ESM) lengkap dengan platform jadibot berbasis website,
server game web (multiplayer + trading + RPG), dan skrip deploy untuk panel Pterodactyl / VPS.

Repo ini berisi **source code apa adanya** dari versi yang berjalan di produksi. Kredensial
(API key, token, nomor owner, email, rahasia server) sudah diganti placeholder, sedangkan
**kredit penulis dipertahankan utuh** — lihat [`bot/CREDITS.md`](bot/CREDITS.md) dan
[`bot/CREDITS_PELENGKAP.md`](bot/CREDITS_PELENGKAP.md).

> **Baru pertama kali?** Baca **[TUTORIAL.md](TUTORIAL.md)** — panduan langkah demi langkah
> dari nol sampai bot online, termasuk cara mengisi kredensial sendiri.

---

## Isi repo

| Folder | Isi |
|---|---|
| [`bot/`](bot) | Script bot WhatsApp: `main.js`, 2000+ plugin, `lib/` (AI, RPG, backup, jadibot), `integrations/`, `public/realms` (frontend RPG) |
| [`website/`](website) | Website jadibot (Vercel): halaman studio, API platform, panel owner, backup |
| [`portfolio/`](portfolio) | Halaman portofolio statis |
| [`standalone/realms/`](standalone/realms) | Server RPG mandiri (Node + SQLite, tanpa bot) |
| [`db-mirror/`](db-mirror) | Server game web: multiplayer (Uno, catur, ular tangga, monopoli, empire, werewolf), halaman trading, mirror backup |
| [`deploy/`](deploy) | Contoh deploy: systemd, nginx, Dockerfile, skrip VPS |

## Fitur utama bot

- **Plugin dinamis** — 2000+ modul dimuat otomatis dari `plugins/` + `integrations/`.
- **AI** — percakapan, memori konteks, banyak model (Gemini, OpenAI-compatible, Groq, dll),
  AI Agent & AI Owner untuk website.
- **Jadibot** — pelanggan menyambungkan nomor WhatsApp sendiri lewat website.
- **Downloader & media** — YouTube (mp3/mp4), Instagram, TikTok, Spotify, Pinterest, dll.
- **Grup** — anti-link, anti-spam, anti-toxic, tagall, hidetag, jadwal buka/tutup.
- **Game & RPG** — game chat + RPG web (realms) yang terhubung ke akun WhatsApp.
- **Trading** — pasar saham $AS berbasis web, terhubung ke nomor WhatsApp pemain.
- **Ekonomi** — limit, energi, koin, level, EXP, premium, referral.
- **Backup otomatis** — arsip harian berkala, bisa dikirim ke grup Telegram.
- **Multi-bahasa** — Indonesia & Inggris.
- **Rin API** — 284 endpoint (AI, gambar, download, search, stalker, komik, anime,
  tools, game) bisa dipanggil langsung dari WhatsApp: `.xai`, `.ximg`, `.xdl`,
  `.xcari`, `.xstalk`, `.xfun`, `.xcv`, `.xmk`, `.xgame`, `.xberita`, `.xkomik`,
  `.xanime`, `.xtool`, `.xprem`, `.xsys`, `.xapi`, `.xrina`.

## Persyaratan

- **Node.js 20+** (disarankan 22/23 — produksi memakai Node 23).
- RAM minimal **1 GB** (disarankan 2 GB), disk ~2 GB untuk `node_modules`.
- `ffmpeg` (opsional, untuk konversi audio/video).
- `yt-dlp` — letakkan di `bot/bin/yt-dlp` (otomatis diunduh saat pertama dipakai).
- Untuk website: akun **Vercel** + project **Supabase**.

## Mulai cepat

```bash
git clone https://github.com/<user>/<repo>.git
cd <repo>/bot
npm install
cp config.example.js config.js     # lalu isi nomor owner & prefix
node main.js
```

Ikuti **[TUTORIAL.md](TUTORIAL.md)** untuk konfigurasi lengkap (`.platform.env`,
website, game server, deploy panel).

## Struktur konfigurasi

| Berkas | Wajib? | Isi |
|---|---|---|
| `bot/config.js` | ya | identitas owner, prefix, port API |
| `bot/.platform.env` | untuk website | rahasia platform, Supabase, Telegram, Gemini |
| `bot/.backup-system.env` | opsional | jadwal & retensi backup |
| `bot/.tunnel.env` | opsional | token Cloudflare Tunnel (akses publik API) |
| `bot/lib/webgame.json` | untuk trading | alamat + token server game |
| `bot/.env.apikeys` | opsional | kunci API pihak ketiga (dibuat dari halaman Setting website) |

Semua berkas di atas **sudah di-`.gitignore`**. Contoh bentuknya ada di
`*.example.env` / `*.example.json` / `config.example.js`.

### Kunci API pihak ketiga

Semua fitur yang butuh API/token membaca kuncinya dari satu tempat:
`bot/config/settings.js` (`global.apiKeys`), berkas `.env.apikeys` yang diisi dari
halaman Setting website, atau environment (`UMI_TENOR_KEY`, `UMI_PASTEBIN_KEY`,
`UMI_NEURALFRAMES_TOKEN`, `GEMINI_API_KEY`, …). Kalau kosong, fitur terkait hanya
membalas "belum dikonfigurasi" — tidak crash dan tidak mengganggu fitur lain.
Panduan lengkap: [TUTORIAL bagian 16](TUTORIAL.md#16-kunci-api-pihak-ketiga-satu-tempat-settingsjs).

## Catatan keamanan

- Jangan pernah commit `config.js`, `.env`, `creds.json`, atau folder `sessions/`.
- `sessions/` berisi kredensial WhatsApp — siapa pun yang memegangnya bisa memakai nomor itu.
- API bot sebaiknya hanya diakses lewat reverse proxy/tunnel HTTPS, bukan port terbuka.
- Beberapa plugin memakai API pihak ketiga gratis; kalau endpoint-nya berubah, plugin bisa
  berhenti bekerja tanpa mengganggu fitur lain.

## Lisensi

MIT — lihat [LICENSE](LICENSE). Sebagian plugin berasal dari proyek komunitas terbuka.
Kredit penulis asli dipertahankan: `By AlzRiss` pada banyak berkas, `CREDITS.md`,
`CREDITS_PELENGKAP.md`, plugin kredit (`umi-credit.js`, `credit.js`), dan kredit
pihak ketiga di dalam plugin. **Mohon jangan hapus atau ganti kredit tersebut.**
