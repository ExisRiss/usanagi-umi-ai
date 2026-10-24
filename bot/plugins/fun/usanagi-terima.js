/* By AlzRiss - Usanagi Umi AI */

if (!globalThis.usanagiTembak) globalThis.usanagiTembak = new Map()
if (!globalThis.usanagiPasangan) globalThis.usanagiPasangan = new Map()

function getMentioned(m) {
  const ctx =
    m?.raw?.message?.extendedTextMessage?.contextInfo ||
    m?.currentMessage?.extendedTextMessage?.contextInfo
  const list = ctx?.mentionedJid
  return Array.isArray(list) && list.length ? list[0] : null
}

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
      `*TERIMA*\n\n` +
      `Tidak ada tembakan aktif untukmu.\n` +
      `Reply tembakan atau gunakan .terima @user`
    )
  }

  if (shooter === m.sender) {
    return m.reply('Tidak valid.')
  }

  globalThis.usanagiPasangan.set(m.sender, shooter)
  globalThis.usanagiPasangan.set(shooter, m.sender)

  const tagS = '@' + shooter.split('@')[0].split(':')[0]
  const tagT = '@' + m.sender.split('@')[0].split(':')[0]

  await conn.sendMessage(
    m.chat,
    {
      text:
        `*DITERIMA*\n\n` +
        `${tagT} menerima tembakan dari ${tagS}\n\n` +
        `Selamat, kalian resmi berpasangan.`,
      mentions: [shooter, m.sender],
    },
    { quoted: m.raw }
  )
}

handler.command = /^(terima|accept)$/i
handler.help = ['terima']
handler.tags = ['fun']
handler.description = 'Menerima tembakan'
handler.group = true

export default handler
