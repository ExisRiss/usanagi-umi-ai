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


/*

# Fitur : Gatau
# Type : Plugins ESM
# Created by : https://whatsapp.com/channel/0029VbDBOXH11ulIKHVbmO0m
# Api : Local Logic

   ⚠️ _Note_ ⚠️
jangan hapus wm ini banggg

*/

const pluginConfig = {
  name: "moveon",
  alias: [],
  category: "fun",
  description: "Imported from Usanagi Umi AI V4.6",
  usage: "",
  example: "",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
    const conn = sock;
  const alasanGagal = [
    "*Error: Masih menyimpan fotonya di galeri*",
    "*Error: Masih suka stalking story-nya tiap malam*",
    "*Error: File hati sedang digunakan oleh proses lain: 'rindu.exe'*",
    "*Error: Gagal menghapus karena kenangan terlalu dalam*",
    "*Error: Sistem mendeteksi denyut jantung meningkat saat melihat namanya*",
    "*Error: Modul 'ikhlas.dll' belum terpasang*",
    "*Error: Masih berharap tanpa sadar*",
    "*Error: Masih ingat semua kata sandi dia*",
    "*Error: Proses move on terhenti, karena lagu 'Kenangan Manis.mp3' diputar kembali*",
    "*Error: Chat terakhir belum dihapus, masih dibaca berulang-ulang*"
  ]

  const teks = [
    "⏳ *Menjalankan perintah: moveon.exe*",
    "⌛ Mengakses direktori kenangan...",
    "⌛ Menemukan 1.042 file terkait: mantan.jpg, tawa.mp3, chat_kita.txt, pelukan terakhir.mp4",
    "⌛ Menghapus file: mantan.jpg",
    "⌛ Menghapus file: tawa.mp3",
    "⌛ Menghapus file: chat_kita.txt",
    "⌛ Menghapus file: pelukan terakhir.mp4",
    "⌛ Membersihkan folder: /hati/kenangan/spesial",
    "⌛ Menghapus log malam_nangis.log",
    "⌛ Menghapus config: harapan.yaml",
    "⌛ Menonaktifkan modul: berharap_lagi.dll",
    "⌛ Menutup port luka_terbuka 4040",
    "⌛ Mencabut izin akses memori emosional",
    "⌛ Restart sistem perasaan...",
    "⌛ Verifikasi status...",
    "❌ *Gagal*"
  ]

  for (let i = 0; i < teks.length; i++) {
    setTimeout(() => {
      conn.sendMessage(m.chat, { text: teks[i] }, { quoted: m })
    }, i * 1600)
  }

  
  setTimeout(() => {
    let alasan = alasanGagal[Math.floor(Math.random() * alasanGagal.length)]
    conn.sendMessage(m.chat, { text: alasan }, { quoted: m })
  }, teks.length * 1600)
}

/* Compatibility adapter — By AlzRiss - Usanagi Umi AI */
const __umiCommands = ["moveon"]
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
__umiHandler.help = ["moveon"]
__umiHandler.tags = ["fun"]
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
