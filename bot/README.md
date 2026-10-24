# bot — Usanagi Umi AI

Script bot WhatsApp (Baileys, ESM). Entry point: `main.js` (atau `scripts/boot.js`
untuk wrapper yang memperbaiki modul native dan membersihkan temp).

```bash
npm install
cp config.example.js config.js   # isi nomor owner & prefix
node main.js
```

Panduan lengkap (config, pairing, website, game, deploy, troubleshooting):
lihat **[../TUTORIAL.md](../TUTORIAL.md)**.

## Struktur singkat

| Path | Isi |
|---|---|
| `main.js` | bootstrap bot, handler pesan, koneksi Baileys |
| `handler.js` | router perintah & plugin |
| `plugins/` | plugin utama (per folder kategori) |
| `integrations/` | plugin hasil migrasi (pakai awalan `.usanagi-*` bila bentrok) |
| `lib/` | mesin: AI, RPG, backup, jadibot, platform API |
| `core/` | utilitas inti & panggilan |
| `scripts/` | `boot.js`, worker backup, utilitas |
| `public/realms/` | frontend RPG |
| `tests/` | uji unit (`node --test`) |

## Berkas yang TIDAK ada di repo (buat sendiri)

`config.js`, `.platform.env`, `.backup-system.env`, `.tunnel.env`, `lib/webgame.json`,
`sessions/`, `data/`. Semua ada di `.gitignore`. Contoh bentuknya:
`config.example.js`, `.env.example`, `.backup-system.example.env`, `lib/webgame.example.json`.
