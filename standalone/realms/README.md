# Eclipse Realms — preview terisolasi

Dari **root source lengkap** (jangan salin folder ini sendirian):

```sh
npm ci --prefix standalone/realms
cd standalone/realms
REALMS_MODE=preview REALMS_DATA_DIR=./data PORT=4173 npm start
```

Node 22 LTS direkomendasikan; minimum Node 20.19. Linux perlu Python 3, make, g++ jika native SQLite tidak mendapat prebuild. Buka `http://localhost:4173/realms`, klik **Mainkan versi tes**, pilih nama dan class. Tidak membutuhkan WhatsApp/Supabase/token produksi. Port bind 0.0.0.0.

Di Arena gunakan kartu **Live Preview**. URL sandbox mentah dapat ditolak gateway E2B karena memerlukan akses platform. Preview sementara, bukan hosting permanen. Data SQLite tersimpan saat reload/restart selama direktori datanya tetap ada, tetapi bukan jaminan backup/lifetime sandbox.

`GET /health`: mode preview, productionLinked=false. Empat class; desa/hutan Greenleaf; Royal Capital; Hollow Crypt solo. Ambil quest Elder Rowan, beli/equip senjata dan armor, kalahkan tiga slime, klaim quest untuk membuka dungeon. Jalan ke portal yang ditandai di peta; lihat **Atlas**. Hadiah tidak diberikan sebelum encounter/quest selesai.

**Jangan arahkan REALMS_DATA_DIR ke database produksi atau impor guest ke akun WA.** Endpoint guest hanya ada dalam server standalone, bukan handler produksi. Guest memperoleh saldo/consumable uji. Cookie sesi HttpOnly/SameSite=Strict; gunakan HTTPS pada host publik. Port HTTP mentah pada IP publik bukan konfigurasi login yang didukung.

## Browser QA

Jalankan server dengan data uji, lalu dari folder ini:

```sh
npx playwright install --with-deps chromium
REALMS_TEST_ORIGIN=http://127.0.0.1:4173 node tests/browser-world.mjs
```

Menghasilkan 16 pemeriksaan + screenshot di `test-results/`; membuat dua akun guest nyata pada server uji. **Jangan jalankan terhadap produksi.** `REALMS_TEST_OUTPUT` dapat mengganti folder hasil. Tool ini menguji UI, pergerakan dan pertarungan server sebenarnya; bukan seluruh master spec MMORPG.

Panduan Docker, seluruh bot/website, migrasi privat dan batasan QA: `../../docs/VPS-MIGRATION-TASK47.md`.
