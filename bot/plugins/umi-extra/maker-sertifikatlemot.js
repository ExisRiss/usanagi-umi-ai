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

export const FEATURE_CREDIT = 'By AlzRiss - Usanagi Umi AI';


import { createCanvas } from '@napi-rs/canvas'

const pluginConfig = {
  name: "sertifikatlemot",
  alias: [],
  category: "maker",
  description: "Imported from Usanagi Umi AI V4.6",
  usage: "",
  example: "",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { text, sock }) {
    const conn = sock;
  const nama = text || m.pushName || 'Orang Lemot'

  const alasan = pick([
    'karena membalas chat 2 hari sekali',
    'karena loading mulu padahal sinyal 5G',
    'karena buka WA kayak nunggu sinetron tayang ulang',
    'karena suka bales "iya" 3 minggu kemudian',
    'karena kecepatan responnya ngalahin kura-kura pensiun'
  ])

  try {
    const canvas = createCanvas(800, 600)
    const ctx = canvas.getContext('2d')

    // Background
    ctx.fillStyle = '#f3f3f3'
    ctx.fillRect(0, 0, 800, 600)

    // Header
    ctx.fillStyle = '#000'
    ctx.font = 'bold 34px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('🐢 SERTIFIKAT KELEMBAMAN INTERNASIONAL 🐢', 400, 80)

    // Nama
    ctx.font = '28px Arial'
    ctx.fillText(`Dianugerahkan kepada: ${nama}`, 400, 170)

    // Alasan
    ctx.font = '22px Arial'
    ctx.fillText(`Sebagai pengakuan resmi`, 400, 230)
    ctx.fillText(`${alasan}`, 400, 270)

    // Footer
    ctx.font = '18px Arial'
    ctx.fillText('Dikeluarkan oleh: Komite Anti Slow Respon Dunia', 400, 450)
    ctx.fillText(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 400, 490)

    ctx.fillText('_______________________', 400, 540)
    ctx.fillText('TTD: Ketua Lemot Nasional', 400, 570)

    const buffer = canvas.toBuffer()
    await conn.sendFile(m.chat, buffer, 'sertif-lemot.jpg', `📜 Sertifikat resmi untuk *${nama}*`, m)
  } catch (e) {
    console.error(e)
    m.reply('❌ Gagal membuat sertifikat lemot.')
  }
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

/* Compatibility adapter — By AlzRiss - Usanagi Umi AI */
const __umiCommands = ["sertifikatlemot"]
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
__umiHandler.help = ["sertifikatlemot"]
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
