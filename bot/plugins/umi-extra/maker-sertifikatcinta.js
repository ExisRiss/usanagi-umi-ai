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


import { createCanvas, loadImage } from '@napi-rs/canvas'
import fs from 'fs'
import path from 'path'

const pluginConfig = {
  name: "sertifikatcinta",
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
  const nama = text || m.pushName || 'Kamu'
  const alasan = pick([
    'karena terlalu tampan hingga memicu pemanasan global',
    'karena senyumnya bikin resah warga +62',
    'karena cinta palsunya berhasil menyakiti banyak hati',
    'karena telah membuat 7 dari 10 orang gagal move on',
    'karena berhasil ghosting dengan cara elegan'
  ])

  try {
    const width = 800, height = 600
    const canvas = createCanvas(width, height)
    const ctx = canvas.getContext('2d')

    // Background
    ctx.fillStyle = '#fff0f5'
    ctx.fillRect(0, 0, width, height)

    // Judul
    ctx.fillStyle = '#e91e63'
    ctx.font = 'bold 36px Sans'
    ctx.textAlign = 'center'
    ctx.fillText('💘 SERTIFIKAT CINTA PALSU 💘', width / 2, 100)

    // Nama
    ctx.fillStyle = '#000'
    ctx.font = '28px Sans'
    ctx.fillText(`Diberikan kepada: ${nama}`, width / 2, 200)

    // Alasan
    ctx.font = '22px Sans'
    ctx.fillText(`Sebagai penghargaan`, width / 2, 260)
    ctx.fillText(`karena ${alasan}`, width / 2, 300)

    // Footer
    ctx.font = '18px Sans'
    ctx.fillText(`Dikeluarkan oleh: Dinas Cinta Palsu Internasional`, width / 2, 450)
    ctx.fillText(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, width / 2, 490)

    // TTD
    ctx.fillText(`____________________`, width / 2, 550)
    ctx.fillText(`Direktur Patah Hati Nasional`, width / 2, 575)

    const buffer = canvas.toBuffer()
    await conn.sendFile(m.chat, buffer, 'sertifikat-cinta.jpg', `📜 Sertifikat untuk *${nama}* berhasil dibuat.`, m)
  } catch (e) {
    console.error(e)
    m.reply('❌ Gagal membuat sertifikat cinta palsu.')
  }
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

/* Compatibility adapter — By AlzRiss - Usanagi Umi AI */
const __umiCommands = ["sertifikatcinta"]
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
__umiHandler.help = ["sertifikatcinta"]
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
