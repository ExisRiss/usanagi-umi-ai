
import { isAnticallActive, setAnticallStatus } from '../../core/awang-call.js'

const handler = async (m, { conn, usedPrefix }) => {
  const mode = (m.args[0] || '').toLowerCase()

  if (mode !== 'on' && mode !== 'off') {
    const active = await isAnticallActive()
    await conn.sendMessage(
      m.chat,
      {
        text:
          `Status Anti Call saat ini: *${active ? 'AKTIF' : 'NONAKTIF'}*\n\n` +
          `Cara pakai:\n${usedPrefix}anticall on\n${usedPrefix}anticall off`,
      },
      { quoted: m.raw }
    )
    return
  }

  const enabled = mode === 'on'
  await setAnticallStatus(enabled)

  await conn.sendMessage(
    m.chat,
    { text: enabled ? 'Sistem Anti Call berhasil *diaktifkan*.' : 'Sistem Anti Call berhasil *dinonaktifkan*.' },
    { quoted: m.raw }
  )
}

handler.command = /^anticall$/i
handler.help = ['anticall']
handler.tags = ['owner']
handler.description = 'Mengaktifkan atau menonaktifkan sistem Anti Call'
handler.ownerOnly = true

export default handler
