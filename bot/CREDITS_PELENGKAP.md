# Kredit dan batas integrasi

- Usanagi Umi AI / integrasi native: AlzRiss.
- OURIN MD 3.3: Hyyu / Zann; https://tiktok.com/@ourinmd.
- RimuruMD v4.7: Anita Putri Azzahra. Sumber menyatakan Rimuru adalah rename/turunan OURIN; bukan dua katalog independen.
- Komentar kredit asli dipertahankan di `integrations/`. Akun, API key, sesi dan database milik pembuat arsip tidak digunakan.
- Referensi arsip: Rimuru SHA256 `848873a9c78285bf65be640b9d8abfb3dc48425568f330245fb179cd2d301e36`; OURIN SHA256 `d55cd80948c73ee78e20fb450faf43358f65947668fccf597b21607808586602`.
- 1.091 handler tambahan lolos pemuatan modul pada Node v23.11.1; ini bukan klaim seluruh API eksternal atau alur permainan telah teruji.
- Fitur berisiko, membutuhkan port hook, ekspor tidak didukung, atau dependensi yang belum tersedia tidak diaktifkan. Detail: `FEATURE_MIGRATION_REPORT.json`.
- Perintah utama memakai namespace unik sumber-kategori-nama, misalnya `/rimuru-tools-biner Hello`. Alias yang bentrok tidak menimpa fitur native.
- Energi RPG disimpan terpisah dari kuota native agar tidak mengurangi kuota dua kali.
