// Safe template only. Keep real credentials, phone numbers, channel IDs, and
// runtime configuration outside version control.
global.owner = [['YOUR_OWNER_NUMBER', 'Owner', true]]
global.mainBot = { defaultPrefix: '/', registrationRequired: true }
global.jadibotPlatform = {
  enabled: true,
  apiPort: 3854,
  supabaseUrl: 'https://YOUR_PROJECT.supabase.co',
  supabaseAnonKey: 'YOUR_PUBLIC_ANON_KEY',
  ownerEmails: ['owner@example.com'],
  lockedOwnerNumber: 'YOUR_LOCKED_OWNER_NUMBER',
}

// ---------------------------------------------------- kunci API pihak ketiga
// Semua fitur yang butuh API mengambil kunci dari sini (lihat config/api-keys.js).
// Kosongkan yang tidak kamu punya — fitur itu akan membalas "belum dikonfigurasi",
// fitur lain tetap jalan normal.
global.apiKeys = {
  tenor: '',            // pencarian GIF (Tenor)          -> env UMI_TENOR_KEY
  pastebin: '',         // upload teks ke Pastebin        -> env UMI_PASTEBIN_KEY
  neuralFrames: '',     // image to prompt (NeuralFrames) -> env UMI_NEURALFRAMES_TOKEN
  gemini: '',           // AI Gemini                      -> env GEMINI_API_KEY
  groq: '',             // AI Groq                        -> env GROQ_API_KEY
  openai: '',           // AI OpenAI-compatible           -> env OPENAI_API_KEY
}

// Cek status kunci yang sudah terisi: ketik .owner atau lihat halaman setting.

// ------------------------------------------------- proxy media YouTube
// Player .ytplay memutar video lewat domain publik bot supaya tidak kena
// "WebSocket error" (link googlevideo terikat ke IP server).
// Isi dengan alamat publik panel/domain bot kalau belum ada di .platform.env.
global.media = {
  proxyBase: process.env.UMI_MEDIA_PROXY_BASE || process.env.PLATFORM_PUBLIC_BASE_URL || '', // mis. https://bot.contoh.com
  proxyEnabled: true,
  proxyHosts: [], // host tambahan yang boleh di-proxy
}
