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

import axios from "axios";
import FormData from "form-data";
import QRCode from "qrcode";
import mime from "mime-types";

const pluginConfig = {
    name: 'qrcodefile',
    alias: ['qrfile', 'fileqr', 'filetoqr', 'qruguu'],
    category: 'tools',
    description: 'Mengupload media/file ke Uguu.se dan membuat QR Code berisi URL file tersebut',
    usage: '.qrcodefile (kirim dengan caption atau reply media/file/viewonce/dokumen)',
    example: '.qrcodefile',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
};

const API = "https://uguu.se/upload.php";
const SIZE = 1024;
const FOREGROUND = "#000000";
const BACKGROUND = "#FFFFFF";
const UA = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36";

async function uploadFile(buffer, filename, mimeType) {
  const form = new FormData();
  form.append("files[]", buffer, {
    filename: filename,
    contentType: mimeType
  });

  const res = await axios.post(API, form, {
    timeout: 120000,
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    validateStatus: () => true,
    headers: {
      ...form.getHeaders(),
      accept: "*/*",
      origin: "https://uguu.se",
      referer: "https://uguu.se/",
      "user-agent": UA,
      "sec-ch-ua": '"Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"',
      "sec-ch-ua-mobile": "?1",
      "sec-ch-ua-platform": '"Android"',
      "sec-fetch-site": "same-origin",
      "sec-fetch-mode": "cors",
      "sec-fetch-dest": "empty",
      "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7"
    }
  });

  const url = res.data?.files?.[0]?.url || null;

  if (res.status !== 200 || res.data?.success !== true || !url) {
    throw new Error(res.data?.message || `Upload gagal dengan status HTTP ${res.status}`);
  }

  return url;
}

async function makeQrBuffer(url) {
  return await QRCode.toBuffer(url, {
    type: "png",
    errorCorrectionLevel: "H",
    margin: 4,
    width: SIZE,
    color: {
      dark: FOREGROUND,
      light: BACKGROUND
    }
  });
}

async function handler(m, { usedPrefix, prefix, command, sock, conn }) {
  const clientBot = sock || conn;
  const pfx = usedPrefix || prefix || '.';

  // Ambil target pesan (bisa dari pesan sendiri dengan caption atau pesan yang direply)
  const target = m.quoted ? m.quoted : m;

  // Bedah struktur pesan Baileys secara mendalam untuk mendeteksi media (termasuk viewOnce, forwarded, dll)
  const rawMsg = target.message || target.msg || target;
  const innerMsg = 
    rawMsg.viewOnceMessage?.message || 
    rawMsg.viewOnceMessageV2?.message || 
    rawMsg.documentWithCaptionMessage?.message ||
    rawMsg.ephemeralMessage?.message ||
    rawMsg;

  const mediaObj = 
    innerMsg.imageMessage || 
    innerMsg.videoMessage || 
    innerMsg.audioMessage || 
    innerMsg.documentMessage || 
    innerMsg.stickerMessage ||
    rawMsg.imageMessage ||
    rawMsg.videoMessage ||
    rawMsg.audioMessage ||
    rawMsg.documentMessage ||
    rawMsg.stickerMessage;

  const mimeType = mediaObj?.mimetype || target.mimetype || '';
  const hasMedia = Boolean(mediaObj || target.mediaMessage || /image|video|audio|document|sticker/i.test(mimeType));

  if (!hasMedia) {
    return await m.reply(
      `*Format Salah!*\n\n` +
      `📌 *Cara Penggunaan:*\n` +
      `• Kirim media dengan caption \`${pfx}${command}\`\n` +
      `• Atau reply foto/video/dokumen/pesan media apa pun dengan perintah \`${pfx}${command}\``
    );
  }

  if (typeof m.react === 'function') await m.react('⏳');

  try {
    let mediaBuffer;

    // Coba unduh menggunakan fungsi download bawaan target/quoted/klien
    if (typeof target.download === 'function') {
      mediaBuffer = await target.download();
    } else if (typeof m.download === 'function') {
      mediaBuffer = await m.download();
    } else if (clientBot.downloadMediaMessage) {
      mediaBuffer = await clientBot.downloadMediaMessage(target);
    }

    if (!mediaBuffer && target.msg && typeof target.msg.download === 'function') {
      mediaBuffer = await target.msg.download();
    }

    if (!mediaBuffer) {
      throw new Error("Gagal mengunduh file media. Pastikan kamu mereply atau mengirimkan file media yang valid.");
    }

    const ext = mime.extension(mimeType) || 'bin';
    const filename = `file_${Date.now()}.${ext}`;

    const uploadedUrl = await uploadFile(mediaBuffer, filename, mimeType || "application/octet-stream");
    const qrBuffer = await makeQrBuffer(uploadedUrl);

    let caption = `📲 *FILE UPLOADED TO QR CODE*\n────────────────────────────\n\n`;
    caption += `🔗 *URL File:* ${uploadedUrl}\n`;
    caption += `📁 *MIME Type:* ${mimeType || 'unknown'}\n\n`;
    caption += `────────────────────────────\n`;
    caption += `💡 *Catatan:* QR Code di atas berisi URL download dari file kamu. File di Uguu.se disimpan secara sementara (temporary).`;

    await clientBot.sendMessage(
      m.chat,
      {
        image: qrBuffer,
        caption: caption
      },
      { quoted: m }
    );

    if (typeof m.react === 'function') await m.react('✅');

  } catch (error) {
    console.error('QRCodeFile Plugin Error:', error);
    if (typeof m.react === 'function') await m.react('❌');
    await m.reply('❌ *GAGAL*\n\n> ' + (error.message || String(error)));
  }
}

/* Compatibility adapter — By AlzRiss - Usanagi Umi AI */
const __umiCommands = ["qrcodefile", "qrfile", "fileqr", "filetoqr", "qruguu"]
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
__umiHandler.help = ["qrcodefile .qrcodefile (kirim dengan caption atau reply media/file/viewonce/dokumen)"]
__umiHandler.tags = ["tools"]
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
