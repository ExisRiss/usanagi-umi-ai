/* By AlzRiss - Usanagi Umi AI */

if (!globalThis.usanagiTembak) globalThis.usanagiTembak = new Map()

function getMentioned(m) {
  const ctx =
    m?.raw?.message?.extendedTextMessage?.contextInfo ||
    m?.currentMessage?.extendedTextMessage?.contextInfo
  const list = ctx?.mentionedJid
  return Array.isArray(list) && list.length ? list[0] : null
}

const quotes = [
  'Sabar ya, yang lebih baik pasti datang.',
  'Belum jodoh bukan berarti tidak ada jodoh.',
  'Move on, masih banyak kesempatan.',
  'Penolakan adalah bagian dari proses.',
  'Tetap semangat!'
]

const handler = async (m, { conn }) => {
  if (!m.isGroup) {
    return m.reply('Perintah ini hanya bisa digunakan di dalam group.')
  }

  let shooter = getMentioned(m)

  if (!shooter) {
    for (const [key, val] of globalThis.usanagiTembak.entries()) {
      if (val.target === m.sender && val.chat === m.chat) {
        shooter = val.shooter
        globalThis.usanagiTembak.delete(key)
        break
      }
    }
  }

  if (!shooter) {
    return m.reply(
      `*TOLAK*\n\n` +
      `Tidak ada tembakan aktif untukmu.`
    )
  }

  const quote = quotes[Math.floor(Math.random() * quotes.length)]
  const tagS = '@' + shooter.split('@')[0].split(':')[0]
  const tagT = '@' + m.sender.split('@')[0].split(':')[0]

  await conn.sendMessage(
    m.chat,
    {
      text:
        `*DITOLAK*\n\n` +
        `${tagT} menolak tembakan dari ${tagS}\n\n` +
        `${quote}`,
      mentions: [shooter, m.sender],
    },
    { quoted: m.raw }
  )
}

handler.command = /^(tolak|reject)$/i
handler.help = ['tolak']
handler.tags = ['fun']
handler.description = 'Menolak tembakan'
handler.group = true

export default handler
