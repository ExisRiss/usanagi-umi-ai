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
  }
}

export default settings
