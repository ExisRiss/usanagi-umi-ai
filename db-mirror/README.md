> ## ⚠️ PINDAH SERVER (17 Okt 2026) — baca ini dulu
>
> Server `83595f4b` (panel `beyy.ikynebula.my.id`) dan node lama **167.99.67.212
> sudah mati**, jadi game web tidak jalan dari sana lagi.
>
> **Kondisi sekarang (Task77, 20 Okt 2026):** game berjalan **di dalam container
> bot** (`f7811b23`, panel `panel.example.com`), dinyalakan
> oleh `scripts/companion.js` bersama tunnel `umi-games-gwenna` (6f82f294).
> Tunnel API (`72975e9b`) dipasang `start-panel.sh` sebelum companion.
>
> | Bagian | Port internal | Alamat publik |
> |---|---|---|
> | Game web (`game.js`) | `127.0.0.1:3900` | `https://game.example.com` |
> | API bot & verifikasi token | `127.0.0.1:2176` | `https://bot.example.com` |
>
> Deploy: `node tools/deploy-game.mjs` (unggah ke container lalu restart).
> Tunnel: `tunnel-games.yml` (bukan lagi `tunnel-config.yml`).
> Verifikasi token trading: `POST https://jadibot-alzriss.gwenna.my.id/api/platform/verify-token`.
>
> Dokumen di bawah ini masih menggambarkan server `83595f4b` yang lama —
> arsip sejarah, bukan kondisi produksi.

# Umi DB Mirror + Umi Web Games — server beyy `83595f4b`

Satu proses Node.js (tanpa dependensi) di server Pterodactyl **`83595f4b`**
(`aaaaaaaaaVip`, panel `beyy.ikynebula.my.id`, alokasi `192.241.149.63:3348`)
yang mengerjakan tiga hal sekaligus:

| Bagian | Port | Alamat |
|---|---|---|
| Penerima cadangan (`server.js`) | `SERVER_PORT` = 3348 | `http://192.241.149.63:3348` |
| Server game multiplayer (`game.js`) | 127.0.0.1:3900 | `https://game.example.com` |
| Supervisor `cloudflared` (tunnel `umi-games-gwenna`) | — | meneruskan port 3900 ke publik |

Produksi **tidak bergantung** pada layanan cadangan ini; kehilangannya tidak
mematikan bot maupun website.

## 1. Penerima cadangan

Cron cadangan website (Vercel, tiap jam) membuat satu "generasi" dan — selain
menyimpannya di Vercel Blob — mengirim salinan ke layanan ini:

| kind | isi |
|---|---|
| `website` | snapshot tar.gz kode website |
| `website-db` | dump JSON.gz tabel Supabase + metadata Auth |
| `bot` | arsip tar.gz bot (termasuk `database.json`) |
| `jadibot` | arsip tar.gz sesi jadibot |

Hash SHA-256 tiap arsip disimpan sebagai berkas `.json` pendamping dan
dicocokkan pengirim. Retensi: 48 generasi terbaru per jenis.

Env Vercel yang dipakai: `UMI_MIRROR_URL` (kini `http://192.241.149.63:3348`)
dan `UMI_MIRROR_TOKEN`. Nilai token yang sama disimpan di container sebagai
`service-token.txt`.

### API

Semua selain `/health` wajib `Authorization: Bearer <token>`.

- `GET /health` — status + jumlah arsip per jenis
- `POST /mirror/:kind/:generation` — unggah arsip (body mentah .tar.gz/.json.gz)
- `GET /mirror/list` — daftar arsip + ukuran + SHA-256
- `GET /mirror/:kind/:generation` — unduh arsip untuk restore
- `DELETE /mirror/:kind/:generation` — hapus arsip

### Restore singkat

1. Unduh arsip dari `/mirror/:kind/:generation`.
2. Cocokkan `sha256sum` dengan nilai di `/mirror/list`.
3. `bot`/`jadibot`: ekstrak ke direktori bot lalu restart. `website-db`: impor ke
   tabel Supabase. `website`: kode situs.

## 2. Umi Web Games

Enam meja: `uno`, `unoflip`, `chess`, `snakes`, `monopoly`, `werewolf`.
Realtime lewat SSE, tanpa dependensi, halaman tunggal `game.html`.

- `GET /health` — jumlah room, daftar permainan, `openJoinDefault`
- `GET /` dan `GET /:game/:roomId` — halaman room (dibaca ulang dari disk kalau
  `game.html` berubah, jadi unggah berkas baru tidak perlu restart)
- `POST /api/rooms` — buat meja. Dengan **token bot** kursinya langsung
  terverifikasi; dari website statusnya mengikuti mode masuk bebas
- `POST /api/rooms/:id/claim` — minta kursi (nomor WA)
- `POST /api/rooms/:id/verify` — verifikasi WhatsApp (**token bot**) → kode masuk 6 digit
- `POST /api/rooms/:id/enter` — tukar kode masuk dengan token kursi
- `GET /api/rooms/:id/state?token=` — keadaan meja (tangan lawan disensor)
- `GET /api/rooms/:id/events?token=` — SSE
- `POST /api/rooms/:id/action` — aksi pemain (hanya kursi terverifikasi;
  pengecualian: host boleh mengirim `openjoin`)

Token bot dibaca dari `game-token.txt` di container atau env `UMI_GAME_TOKEN`.
Sisi bot: plugin `bot/plugins/game/game-webmultiplayer.js` + konfigurasi
`bot/lib/webgame.json` (berisi token; berkas itu di-gitignore). Perintah memakai
prefix aktif bot (default `/`): `/uno`, `/unoflip`, `/caturweb`, `/utweb`,
`/monopoli`, `/wwweb`, `/webgame`, plus `<perintah> join <id>` dan
`<perintah> <id>` untuk verifikasi. **Catur, ular tangga, dan werewolf wajib
memakai akhiran `web`** — nama polosnya sudah dipakai game WhatsApp lama, dan
halaman web mengambil nama perintah dari server (`state.waCommand`) supaya
keduanya tidak bisa berbeda lagi.

### Mode masuk bebas (`UMI_GAME_OPEN_JOIN`)

Verifikasi WhatsApp butuh bot utama yang tersambung. Kalau bot utama dimatikan
(`MAIN_BOT_ENABLED=false`), tidak ada pemain yang bisa duduk — host sendiri pun
terkunci, jadi meja tidak bisa dimainkan. Selama `UMI_GAME_OPEN_JOIN` tidak
diisi `0`, kursi dari website langsung dianggap terverifikasi, halaman room
menampilkan peringatannya, dan host boleh mematikannya per meja (aksi
`openjoin`). Room buatan bot selalu tetap wajib verifikasi. Matikan global
dengan `UMI_GAME_OPEN_JOIN=0` setelah bot utama online lagi.

Uji:
- `tools/test-webgame.mjs` — alur API dasar (sadar mode masuk bebas)
- `tools/test-game-live.mjs` — memainkan keenam meja sampai selesai di server
  hidup, termasuk regresi deadlock werewolf dan mode masuk bebas
- `tools/test-game-page.mjs` — merender `game.html` di jsdom dan memeriksa
  keluaran tiap meja (butuh `npm install jsdom`)
- `tools/test-webmultiplayer-plugin.mjs` — plugin bot asli

## 3. Tunnel Cloudflare

Tunnel **`umi-games-gwenna`** (`6f82f294-ff18-4966-9b8e-38edd97f8359`),
**lokal-managed**: dibuat lewat API dengan `tunnel_secret` buatan sendiri, jadi
berkas `tunnel-creds.json` bisa direkonstruksi kapan pun. Ingress ada di
`tunnel-config.yml`. DNS: CNAME `game.example.com` →
`6f82f294-….cfargotunnel.com` (proxied).

`server.js` mengutamakan konfigurasi lokal: bila `tunnel-config.yml` **dan**
`tunnel-creds.json` ada, cloudflared dijalankan dengan `--config`. Bila salah
satunya hilang, ia jatuh ke mode token dari `tunnel-token.txt`. Konektor mati →
dicoba lagi tiap 10 detik. Bila biner `cloudflared` belum ada, diunduh sekali
dari rilis resmi Cloudflare.

> **Jangan** memakai tunnel lama `alzriss-okta` (`88438bb0-…`) dengan mode token
> murni. Remote config-nya tidak bisa dibaca/ditulis lewat API token yang ada,
> dan menjalankan mode token di sana terbukti mengosongkan ingress sehingga
> semua hostname jadi 503. Arsip ingress lamanya: `tunnel-config.alzriss-okta.yml`.

## Menjalankan ulang

Di panel: pastikan `server.js`, `game.js`, `game.html`, `package.json`,
`service-token.txt`, `game-token.txt`, `tunnel-config.yml`, `tunnel-creds.json`
ada di root container, `CMD_RUN=npm start`, lalu Start. Egg generik Node.js
menjalankan `npm install` (tanpa dependensi) lalu `npm start`.

Placeholder "Layanan Sedang Disiapkan" menjawab di port 3000/3200/3300/3500/
3600/3700/3800 — sisa ingress aplikasi deployer lama. Matikan dengan
`UMI_PLACEHOLDER=off`. Game bisa dimatikan dengan `UMI_GAMES=off`.
