# USANAGI UMI AI — Global Auto Translate

Fitur ini menambahkan auto-translate global untuk pesan yang dikirim melalui `conn.sendMessage()`.

## Install

```bash
npm install
```

Jika package belum terpasang:
```bash
npm install translate@3.1.0
```

## Penggunaan

- `.lang id` → kembali ke bahasa Indonesia
- `.lang en` → semua pesan plugin diterjemahkan ke English
- `.lang status` → cek bahasa chat

Pengaturan disimpan per-chat di:
`global.db.data.chats[m.chat].language`

## Cara kerja

Tidak perlu mengubah plugin satu per satu. Translator dipasang di `lib/simple.js` pada jalur `conn.sendMessage()`, sehingga `m.reply()`, `conn.reply()`, `conn.sendFile()` (caption), dan pengiriman message yang melewati `sendMessage()` ikut tertangani.

Teks/label yang umum pada payload seperti `text`, `caption`, `title`, `description`, `footer`, dan beberapa struktur button/list diterjemahkan. URL, JID, ID tombol, filename, dan buffer media tidak diterjemahkan.

Bahasa sumber plugin diasumsikan Indonesia. Target default adalah Indonesia; `.lang en` mengaktifkan terjemahan ke English.

Package yang digunakan: `translate` 3.1.0, dengan Google sebagai engine default.
