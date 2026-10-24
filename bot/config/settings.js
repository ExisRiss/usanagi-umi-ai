// Compatibility adapter for plugins ported from Umi Usanagi AI.
// Main AlzRiss configuration remains in ../config.js.

export const settings = {
  botName: global.namebot || 'Umi Usanagi AI',
  botAlias: 'Umi Usanagi',
  ownerName: global.ownerName || global.author || 'AlzRiss',
  ownerNumbers: (global.owner || []).map(item => Array.isArray(item) ? item[0] : item),
  links: {
    // Use the official per-bot group URL from config.js / Jadibot session config.
    groupLink: global.links?.groupUrl || '',
    groupId: global.links?.groupId || '',
    channelLink: global.ownerInfo?.entity_url || global.links?.channelUrl || '',
    channelId: global.links?.channelId || '',
    githubLink: global.scriptUrl || ''
  },
  defaultPrefix: '.',
  // Task64: ON/OFF limit untuk bot utama (website menulis ke global.mainBot).
  limitEnabled: global.mainBot?.limitEnabled !== false,
  timezone: 'Asia/Makassar',
  footerText: global.namebot || 'Umi Usanagi AI',
  footerYear: '2026',
  botVersion: '7.1',
  botMode: 'Public',
  sticker: {
    pack: global.stickpack || global.namebot || 'Umi Usanagi AI',
    author: global.stickauth || global.author || 'AlzRiss'
  },
  messageRouting: {
    respondToSelf: true
  },
  pairingNumber: '',
  menuImage: 'media/menu.png',
  replyVariant: 1,
  donation: {
    danaNumber: '',
    danaName: '',
    qrisImage: ''
  },
  // Proxy media YouTube (dipakai player .ytplay). Link googlevideo terikat ke
  // IP server, jadi video diputar lewat domain publik bot: <proxyBase>/media/yt?u=...
  // Kosong -> player memakai link langsung lalu jatuh ke embed YouTube.
  media: {
    proxyBase: process.env.UMI_MEDIA_PROXY_BASE || process.env.PLATFORM_PUBLIC_BASE_URL || '',
    proxyEnabled: true,
    // Tambahan host yang boleh di-proxy (selain googlevideo/youtube/ytimg/savetube).
    proxyHosts: []
  }
}

// ---------------------------------------------------------------- kunci API
// Semua fitur yang butuh API pihak ketiga mengambil kuncinya dari sini.
// Isi di config.js lewat `global.apiKeys = { tenor: '...' }` atau lewat
// environment (`UMI_TENOR_KEY`, `UMI_PASTEBIN_KEY`, `UMI_NEURALFRAMES_TOKEN`, ...).
// Kalau kosong, fitur terkait hanya membalas "belum dikonfigurasi" — bot tetap jalan.
export {
  apiKey,
  hasApiKey,
  requireApiKey,
  apiKeyStatus,
  refreshApiKeys,
  API_KEY_ENV,
} from './api-keys.js'

export { default as apiKeys } from './api-keys.js'

export default settings
