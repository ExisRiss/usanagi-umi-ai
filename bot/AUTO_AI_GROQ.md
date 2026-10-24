# Auto-AI Groq

Pemicu hanya mention bot atau reply pesan bot. Pesan biasa, pesan bot sendiri, status/broadcast dan command manual tidak diarahkan otomatis.

1. Salin `.env.groq.example` ke `.env.groq` di host bot, isi `GROQ_API_KEY`, dan atur permission 600. Jangan commit/upload file key ke sumber publik.
2. Model teruji: `openai/gpt-oss-120b`. `UMI_AUTO_AI_ENABLED=false` menonaktifkan routing global.
3. Owner website dapat memilih Groq/OpenRouter. Key tersimpan terenkripsi untuk agent website; Groq disinkronkan ke file runtime privat auto-AI. Key kosong mempertahankan key provider yang tersimpan.
4. Prompt: `lib/auto-ai-prompt.js`. Pemilihan memakai katalog plugin saat runtime; command dijalankan oleh dispatcher native, bukan eval/shell LLM.
5. Admin/owner/bot-admin, registrasi, premium, level, kuota, mode publik/privat, daftar blokir dan command nonaktif tetap berlaku. Kebijakan private-chat premium lama tidak diubah.
6. Main dan Jadibot memakai socket dan konfigurasi percakapan masing-masing. Membalas pesan main bot dari Jadibot lain tidak memindahkan eksekusi.
7. Contoh: mention bot lalu "tolong tutup grup"; admin + bot-admin wajib. Reply bot lalu "download video TikTok ini https://..."; media dikirim oleh downloader native setelah berhasil.
8. Bot tidak menyatakan berhasil sebelum command/media benar-benar dijalankan. Pembelian, transfer, shell, reset, credential dan operasi destruktif tidak dieksekusi otomatis.
9. Jalankan `npm run test:auto-ai` dan `node --test tests/imported-compat.test.mjs`. Memuat semua handler: `node scripts/feature-smoke.mjs`; jangan jalankan arsip tanpa audit.

Batas verifikasi: contoh WhatsApp memerlukan bot terhubung, user terdaftar dan grup uji yang disetujui. API pihak ketiga pada seluruh pelengkap belum diuji satu-per-satu.
