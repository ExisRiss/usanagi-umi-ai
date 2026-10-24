# FURINA V18 Integration Audit

## Ringkasan

Source `FURINA V18 6488 FEATURE` diunduh dari tautan yang diberikan pemilik proyek dan diekstrak ke workspace audit terpisah. Source tidak dipasang secara utuh karena menggunakan satu dispatcher CommonJS sekitar 2,7 MB, memiliki 1.998 label command unik, banyak alias yang dihitung sebagai fitur, dependensi lama, endpoint tanpa jaminan, dan fungsi yang berisiko.

Integrasi mengikuti kebijakan Usanagi Umi AI: hanya fitur aman yang belum tersedia, ditulis ulang sebagai plugin ESM terpisah, tanpa menyalin database, session, credential, identitas aktif, owner, atau konfigurasi upstream.

## Fitur baru yang ditulis ulang

- `wanted`, `bounty` — poster buronan berbasis Sharp, tanpa dependensi Skia tambahan.
- `tarot`, `karturama`, `ramalan`, `fortune` — tarot harian untuk hiburan dan refleksi, dengan kartu visual dan disclaimer.
- `qwa`, `quotewa`, `fakeqwa` — generator gambar quote WhatsApp.
- `cekfile`, `checkfile`, `checksyntax`, `syntaxcheck`, `filecheck`, `analisafile`, `lintfile` — pemeriksaan syntax dan pola keamanan statis; file tidak dieksekusi.
- `toprompt`, `img2prompt`, `imagetoprompt` — analisis gambar menjadi prompt dengan pemberitahuan pemrosesan pihak ketiga.
- `pinchat`, `unpinchat` — pengelolaan sematan chat khusus owner dan private chat.
- `checklink`, `validatelink`, `ceklink` — pemeriksaan status URL dengan proteksi SSRF terhadap alamat lokal/private.
- `votekick`, `vkick`, `vote`, `cancelvotekick` — vote kick grup dengan suara unik, batas waktu, perlindungan admin/owner, dan syarat bot admin.

Fitur Threads dari source tidak ditambahkan ulang karena Usanagi sudah memiliki dispatcher `threads/threadsdl`. Fitur NPM downloader, F-Droid, phishing checker, info gempa, lowongan kerja, GSMArena, Apple Maps, tokusatsu, QR tools, dan banyak utility lain juga sudah tersedia dalam koleksi plugin Usanagi sehingga tidak dibuat dispatcher duplikat.

## Kategori yang ditolak

- Crash, virtex, freeze, bug payload, dan fitur perusak klien WhatsApp.
- DDoS, spam OTP, nomor OTP, dan penyalahgunaan layanan komunikasi.
- NSFW/pornografi eksplisit.
- Arbitrary code execution, `addcase`, runtime patching, dan eksekusi shell dari input pengguna.
- Pencurian atau pembukaan view-once tanpa persetujuan.
- Credential, token, session, owner, database, dan konfigurasi upstream.
- Panel/VPS takeover, hackback, mass provisioning, dan fitur administratif berisiko.
- Generator identitas/keuangan yang mudah digunakan untuk penipuan.
- Pembajakan akun/premium dan bypass layanan berbayar.
- Command yang hanya berupa alias, duplikat fitur yang sudah ada, API mati, atau implementasi yang tidak mandiri.

## Kredit

