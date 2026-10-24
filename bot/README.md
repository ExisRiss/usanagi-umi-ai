# Usanagi Umi AI v7

Bot WhatsApp multi-device dengan menu modern dan sistem plugin dinamis. Tampilan menu, arsitektur plugin, dan kumpulan fitur v7 diadaptasi dari **Usanagi v7 English × Indonesia**, kemudian dibersihkan dan di-rebrand untuk Usanagi Umi AI.

## Fitur utama

- Empat gaya menu dinamis dan all-menu berdasarkan kategori plugin.
- **792 modul plugin** berhasil dimuat saat pengujian tanpa kegagalan import.
- Seluruh **343 plugin Usanagi Umi AI** telah dipindahkan: AI, anime, download, fun, game, group, main, owner, RPG, search, sticker, dan tools.
- AI, anime, downloader, ekonomi, fun, game, grup, informasi, internet, maker, musik, pencarian, stiker, RPG, tools, voice, dan jadibot dari basis sebelumnya tetap tersedia.
- Sistem AI Usanagi yang telah diadaptasi: memori percakapan, cooldown, rich response, code block native, analisis intent, persona/model, serta fallback backend.
- Database pengguna, level, EXP, limit, premium, AFK, blacklist, serta statistik command.
- Moderasi grup: anti-link, anti-spam, anti-toxic, tagall, hidetag, jadwal buka/tutup, dan fitur admin.
- Dukungan bahasa Indonesia dan Inggris.
- Pairing melalui nomor telepon.

Sebagian plugin menggunakan layanan/API pihak ketiga. Plugin tersebut dapat berhenti bekerja jika endpoint pihak ketiganya berubah atau membatasi akses.

## Persyaratan

- Node.js 20 atau lebih baru.
- FFmpeg untuk fitur audio dan video.
- Koneksi internet.

## Instalasi

```bash
npm install
npm start
```

Masukkan nomor WhatsApp dalam format internasional saat diminta, misalnya `628xxxxxxxxxx`.

## Konfigurasi

Seluruh pengaturan utama berada di `config.js`:

```js
global.owner = [
  ['628xxxxxxxxxx', 'AlzRiss', true]
]

global.namebot = 'Usanagi Umi AI'
global.developer = 'AlzRiss × Arena'
global.creditOwners = ['Okta - Owner', 'Risky - Owner']
global.scriptUrl = ''
```

- Ganti nomor owner sebelum bot dijalankan.
- Isi `global.scriptUrl` jika tombol `.sc`/`.script` ingin digunakan.
- Isi konfigurasi pembayaran, panel, gambar publik, atau grup backup hanya bila fiturnya dibutuhkan.
- Jangan mengunggah folder `sessions`, `database.json`, atau data autentikasi ke repositori publik.

## Sistem AI terintegrasi

Seluruh key dan model AI diatur melalui objek `global.usanagiAI` di `config.js`; tidak menggunakan `.env`.

- `.umiai <pertanyaan>` — Gemini dengan memori percakapan dan fallback Gemini Web.
- `.umiai reset` — menghapus memori Gemini.
- `.umiai info` — melihat backend dan status memori.
- `.deepseek <pertanyaan>` — DeepSeek melalui OpenRouter, termasuk vision dan rich response.
- `.deepseek reset|info|limit` — pengelolaan sesi dan status OpenRouter.
- `.grok <pertanyaan>` — Groq AI dengan memori, pilihan model/persona, vision, dan pencarian web yang didukung backend.
- `.grok model`, `.grok mode`, `.grok reset`, `.grok info` — pengaturan Groq per pengguna.

Isi key milikmu sendiri jika ingin menggunakan backend resmi:

```js
global.usanagiAI = {
  geminiApiKey: '',
  geminiModel: 'gemini-2.5-flash',
  openRouterApiKey: '',
  groqApiKey: ''
}
```

Tanpa `geminiApiKey`, `.umiai` mencoba Gemini Web guest. API key bawaan dari arsip sumber tidak disertakan karena merupakan data sensitif.

## Plugin Usanagi lengkap

Semua 343 plugin Usanagi tersedia. Sebanyak 340 plugin non-AI disimpan dengan awalan nama file `usanagi-`, sedangkan tiga plugin AI telah diadaptasi menjadi Usanagi Umi AI, DeepSeek Pro, dan Groq Pro.

Untuk menghindari bentrok dengan command lama, setiap command Usanagi dapat dipanggil melalui namespace:

```text
.usanagi-menu
.usanagi-allmenu
.usanagi-akankah aku sukses?
.usanagi-chess
.usanagi-adventure
.usanagi-inventory
.usanagi-play judul lagu
.usanagi-antilink on
```

Command tanpa namespace tetap dapat bekerja apabila tidak bertabrakan dengan plugin yang sudah ada. Usanagi menu/catalog store disinkronkan dengan loader utama sehingga kategori dan jumlah fitur tetap terbaca.

Plugin `.usanagi-rvo` dipindahkan tetapi dinonaktifkan karena melewati privasi media view-once. Plugin verifikasi pembelian yang membawa credential pihak lain juga dinonaktifkan. Credential yang ditemukan di source telah dikosongkan dan dipindahkan ke konfigurasi `global.externalApiKeys`.

## Media branding

- `media/menu.png` — banner welcome biru Usanagi Umi AI.
- `media/banner.jpg` — banner pesan Welcome ketika pengguna bergabung ke grup.
- Menu utama dan All Menu menggunakan video lokal `assets/video/menu.mp4` melalui `global.brandingAssets.menuVideo`.
- `media/thumbnail.jpg` — foto profil utama.
- `media/avatar_contact.png` — avatar kontak alternatif.
- `bg-template.jpg` — latar maker/welcome berbasis banner gelap.

## Menu

- `.menu` — menu utama.
- `.allmenu` — seluruh fitur berdasarkan kategori.
- `.setmenu` — memilih gaya menu (owner).
- `.lang id` / `.lang en` — mengganti bahasa per chat.

## Keamanan

Versi ini menghapus kredensial dan data pengguna dari arsip sumber, menyalakan kembali verifikasi TLS, serta tidak menyertakan fitur OTP bombing, spam OTP, TikTok boosting, pembaca view-once, pencarian dewasa, generator bukti pembayaran palsu, virtual-number, dan eksekusi shell/eval owner. Pemeriksaan `npm audit` menghasilkan **0 kerentanan yang diketahui** pada saat build.

## UMI API Suite

Semua command integrasi menggunakan namespace murni `umi`, tanpa nama provider. Contohnya `.umigemini`, `.umiplay`, `.umipinterest`, `.umiimg`, `.umidl`, dan `.umitools`. Daftar lengkap tersedia melalui `.umimenu`. Command `.umiai` tetap menjadi AI utama Usanagi Umi AI agar tidak terjadi bentrok.

Suite menyediakan fitur AI, AI image, canvas, downloader, fun, game, berita, maker, pencarian, stalker publik, dan tools. Endpoint penipuan saldo, spam, token akun, serta penghapusan watermark tidak diekspos. Base URL, timeout, dan batas respons tetap dipusatkan dalam `config.js`.

## Respons Cepat dan Stabilitas

Bot menampilkan status **sedang mengetik** tanpa menunggu respons presence dari WhatsApp, sehingga tidak menambah delay pada pesan. Runtime memakai reconnect bertahap anti-tumpuk, watchdog koneksi, interval keep-alive lebih cepat, retry pesan lebih banyak, penyimpanan database non-overlap setiap 30 detik, serta pembersihan temporary file setiap 5 menit. Semua interval utama diatur melalui `global.autoTyping` dan `global.runtimePerformance` dalam `config.js`.

## Installer Plugin dari WhatsApp

Developer utama dapat membalas pesan berisi kode plugin atau dokumen JavaScript lalu menjalankan `.addplugin nama-plugin`. Bot memeriksa ukuran, syntax ES module, bentuk handler, pola keamanan berbahaya, nama file, dan hasil hot reload. Plugin valid disimpan ke `plugins/custom/` dan langsung aktif tanpa restart. Gunakan `.addplugin nama-plugin --replace` untuk mengganti plugin yang sudah ada; versi lama dicadangkan. Fitur ini hanya tersedia untuk `rowner` dan dikonfigurasi melalui `global.pluginInstaller` di `config.js`.

## Identitas Pengguna dan Owner Dinamis

Database pengguna menyatukan identitas WhatsApp PN (`@s.whatsapp.net`) dan LID (`@lid`) agar status `.daftar` tetap terdeteksi di private chat maupun grup. Pendaftaran disimpan langsung tanpa menunggu autosave. Owner yang ditambahkan lewat `.addowner` dikenali secara langsung oleh handler utama, termasuk ketika WhatsApp mengirim identitas LID, sehingga memperoleh akses command owner dan bypass premium seperti owner lainnya.

Command `.me` menampilkan umur dari data `.daftar` meskipun tanggal lahir belum diatur. Akun dalam database owner dinamis ditampilkan dengan role **Owner**, Premium **Yes**, dan limit **Unlimited**. Tanggal lahir dapat disimpan atau diubah memakai `.setbirthday DD-MM-YYYY`, `.setlahir`, atau `.setultah`; format garis miring dan spasi juga didukung. Jika tahun diberikan, umur pada profil diperbarui otomatis.

## UMI Extra Feature Collection

Sebanyak 121 fitur tambahan yang belum tersedia dipindahkan ke `plugins/umi-extra/`. Seluruh plugin memakai format loader Usanagi, nama file UMI, branding aktif **By AlzRiss - Usanagi Umi AI**, serta adapter `conn/sock`, argument, permission, dan prefix. Koleksi mencakup 322 command/alias baru pada tools, pencarian, informasi, Islami, maker, canvas, fun, anime, musik, TTS, sticker, download, dan utility. Plugin duplikat, panel/VPS/store, fitur berisiko, kredensial tertanam, serta source yang memerlukan runtime lama tidak diaktifkan. Daftar asal dan command hasil migrasi tersedia di `plugins/umi-extra/manifest.json`; pengaturan provider dipusatkan melalui `global.umiExtraAPI` di `config.js`.

## Branding

Seluruh fitur, menu, watermark, footer, dan caption menggunakan identitas:

**By AlzRiss - Usanagi Umi AI**

Daftar atribusi source dan kontributor terdahulu dikonsolidasikan dalam [`CREDITS.md`](./CREDITS.md).


## Konfigurasi Bot Utama dan Jadibot

Bot utama memakai konfigurasi global di `config.js`. Setiap akun Jadibot mempunyai profil terpisah di `sessions/jadibot/<nomor>/bot-config.json`; file dibuat otomatis saat sesi dibuat atau dipulihkan. Identitas, prefix default, mode public/private, limit awal, auto-typing, tautan, aset, pengaturan TikTok Rich, dan daftar fitur nonaktif tidak dibagikan antar akun. Kredensial API, session WhatsApp, branding resmi, dan akses owner utama tetap dilindungi serta tidak dapat dioverride profil Jadibot.

Atur akun melalui Jadibot terkait dengan `.jadibotconfig` atau `.jbconfig`. Prefix per chat juga dipisahkan berdasarkan akun bot, sehingga perubahan prefix di bot utama tidak mengubah prefix Jadibot dan sebaliknya.
