/* By AlzRiss - Usanagi Umi AI */
/*
╔══════════════════════════════════════════════╗
║        ⚡  𝑨𝑳𝒁𝑹𝑰𝑺𝑺 𝑴𝑫  ⚡                     ║
╚══════════════════════════════════════════════╝

╭───────────「 ✦ 𝑰𝑵𝑭𝑶 𝑨𝑳𝒁𝑹𝑰𝑺𝑺 ✦ 」───────────╮
│ 👤 Developer : 𝑨𝒍𝒛𝑹𝒊𝒔𝒔
│ 📢 Saluran   : https://whatsapp.com/channel/0029VbDBOXH11ulIKHVbmO0m
│ ⚙️ Engine    : Baileys Multi-Device
╰──────────────────────────────────────────────╯

              「 ⚡ 𝑨𝑳𝒁𝑹𝑰𝑺𝑺 𝑴𝑫 ⚡ 」
*/

import sharp from 'sharp';

const pluginConfig = {
  name: 'cinematic',
  alias: ['moody', 'darktone', 'nighttone', 'filterdark', 'flashmood'],
  category: 'maker',
  description: 'Mengubah foto biasa menjadi Cinematic Dark Retro Flash Tone presisi',
  usage: '.cinematic (Kirim/Reply Foto)',
  example: '.cinematic',
  isEnabled: true,
};

function getMediaMessageAndMime(m) {
  const target = m.isQuoted ? m.quoted : m;
  const msg = target?.message || target;

  const viewOnceMsg = msg?.viewOnceMessage?.message || msg?.viewOnceMessageV2?.message || msg?.viewOnceMessageV2Extension?.message;
  const actualMsg = viewOnceMsg || msg;

  const imageMsg = actualMsg?.imageMessage;
  const docMsg = actualMsg?.documentMessage || actualMsg?.documentWithCaptionMessage?.message?.documentMessage;

  let mimeType = imageMsg?.mimetype || docMsg?.mimetype || target?.mimetype;

  return {
    isImage: Boolean(mimeType && mimeType.startsWith('image/')),
    targetToDownload: target
  };
}

async function handler(m, { sock, prefix, command }) {
  const { isImage, targetToDownload } = getMediaMessageAndMime(m);

  if (!((m.isMedia || m.hasQuotedMedia) && isImage)) {
    return await sock.sendMessage(
      m.chat,
      { text: `⚠️ *Format Salah!*\n\n> Balas/Kirim foto dengan ketik *${prefix || '.'}${command}*` },
      { quoted: m }
    );
  }

  try {
    await m.react('🎞️');

    const inputBuffer = await targetToDownload.download();
    if (!inputBuffer) throw new Error('Gagal mengunduh foto.');

    const metadata = await sharp(inputBuffer).metadata();
    const width = metadata.width || 800;
    const height = metadata.height || 1200;

    // 1. Film Grain Overlay (Simulasi bintik kamera analog 35mm / CCD)
    const filmGrainSvg = Buffer.from(`
      <svg width="${width}" height="${height}">
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/>
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.07 0"/>
        </filter>
        <rect width="${width}" height="${height}" filter="url(#noise)" />
      </svg>
    `);

    // 2. Smooth Vignette Ultra (Penyebaran bayangan sudut yang pekat namun menyatu)
    const smoothVignetteSvg = Buffer.from(`
      <svg width="${width}" height="${height}">
        <defs>
          <radialGradient id="vignette" cx="50%" cy="50%" r="65%" fx="50%" fy="50%">
            <stop offset="30%" stop-color="#000000" stop-opacity="0" />
            <stop offset="75%" stop-color="#000000" stop-opacity="0.35" />
            <stop offset="100%" stop-color="#000000" stop-opacity="0.75" />
          </radialGradient>
        </defs>
        <rect width="${width}" height="${height}" fill="url(#vignette)" />
      </svg>
    `);

    // 3. Amber/Warm Tint Overlay (Efek warna hangat lampu malam / flash retro)
    const warmAmberTintSvg = Buffer.from(`
      <svg width="${width}" height="${height}">
        <rect width="${width}" height="${height}" fill="#ffaa33" opacity="0.06" />
      </svg>
    `);

    // Proses Layering & Adjustment Warna
    const processedBuffer = await sharp(inputBuffer)
      .sharpen({ sigma: 1.2 }) // Memperjelas tekstur pakaian & wajah
      .modulate({
        brightness: 0.88, // Menggelapkan nuansa keseluruhan secara halus
        saturation: 1.20, // Menghidupkan warna kulit & objek
      })
      .linear(1.35, -25) // High Contrast + Deep Crushed Shadow (Area hitam jadi pekat banget)
      .composite([
        { input: warmAmberTintSvg, blend: 'over' },
        { input: smoothVignetteSvg, blend: 'over' },
        { input: filmGrainSvg, blend: 'over' }
      ])
      .jpeg({ quality: 95 })
      .toBuffer();

    await sock.sendMessage(
      m.chat,
      { image: processedBuffer, caption: '✨ *Retro Night Flash Tone*' },
      { quoted: m }
    );

    await m.react('✅');

  } catch (err) {
    console.error('[CINEMATIC ERROR]', err);
    await m.react('❌');
    await sock.sendMessage(
      m.chat,
      { text: `❌ *Gagal memproses gambar:* ${err.message}` },
      { quoted: m }
    );
  }
}

/* Compatibility adapter — By AlzRiss - Usanagi Umi AI */
const __umiCommands = ["cinematic", "moody", "darktone", "nighttone", "filterdark", "flashmood"]
const __umiOriginalHandler = handler
const __umiHandler = async function (m, context = {}) {
  const adapted = Object.create(m)
  Object.defineProperties(adapted, {
    text: { value: String(context.text || ''), writable: true, configurable: true },
    args: { value: context.args || [], writable: true, configurable: true },
    command: { value: String(context.command || '').toLowerCase(), writable: true, configurable: true },
    prefix: { value: context.usedPrefix || '.', writable: true, configurable: true },
    isOwner: { value: Boolean(context.isOwner), writable: true, configurable: true },
    isPremium: { value: Boolean(context.isPrems), writable: true, configurable: true },
    isAdmin: { value: Boolean(context.isAdmin), writable: true, configurable: true },
    isBotAdmin: { value: Boolean(context.isBotAdmin), writable: true, configurable: true }
  })
  return __umiOriginalHandler.call(this, adapted, {
    ...context,
    sock: context.conn,
    conn: context.conn,
    text: String(context.text || ''),
    query: String(context.text || ''),
    args: context.args || [],
    command: String(context.command || '').toLowerCase(),
    prefix: context.usedPrefix || '.',
    usedPrefix: context.usedPrefix || '.',
    db: global.db
  })
}
__umiHandler.help = ["cinematic .cinematic (Kirim/Reply Foto)"]
__umiHandler.tags = ["maker"]
__umiHandler.command = new RegExp(`^(${__umiCommands.map(value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})$`, 'i')
__umiHandler.owner = false
__umiHandler.premium = false
__umiHandler.group = false
__umiHandler.private = false
__umiHandler.admin = false
__umiHandler.botAdmin = false
__umiHandler.limit = false
__umiHandler.source = 'Usanagi Umi AI feature collection'
export default __umiHandler
