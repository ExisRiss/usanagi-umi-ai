// ============================================================================
// config.example.js — salin menjadi config.js lalu isi.
//   cp config.example.js config.js
//
// JANGAN commit config.js. Berkas itu sudah masuk .gitignore.
// Semua nomor/host di bawah hanya contoh.
// ============================================================================

// ---------------------------------------------------------------- identitas
global.owner = [
  ['6281234567890', 'Owner', true],   // [nomor, nama, owner penuh?]
  ['6281234567891', 'Admin', true],
]
global.ownerName = 'Nama Kamu'
global.namebot = 'Usanagi Umi'
global.author = 'Nama Kamu'
global.stickpack = 'Usanagi Umi'
global.stickauth = 'Nama Kamu'

// ---------------------------------------------------------------- perilaku
global.anticall = true               // tolak panggilan masuk otomatis
global.mainBot = {
  defaultPrefix: '.',                // prefix perintah, mis. "." -> ".menu"
  registrationRequired: true,        // wajib /daftar sebelum pakai fitur
}

// ------------------------------------------------------- platform jadibot
// Bagian ini yang dipakai website (Vercel) untuk mengelola sesi & pembayaran.
global.jadibotPlatform = {
  enabled: true,
  apiPort: 3854,                     // port API internal bot (jangan buka ke publik langsung)
  supabaseUrl: 'https://YOUR_PROJECT.supabase.co',
  supabaseAnonKey: 'YOUR_PUBLIC_ANON_KEY',
  ownerEmails: ['owner@example.com'],
  lockedOwnerNumber: '6281234567890',
}

// ---------------------------------------------------------------- link
global.links = {
  groupUrl: '',
  groupId: '',
  channelUrl: '',
  channelId: '',
}
