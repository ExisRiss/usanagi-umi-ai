import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, isOwner }) => {
  if (!isOwner) return m.reply('❌ Khusus Owner!')

  const quoted = m.quoted

  if (!quoted) {
    return m.reply(
      '📸 Reply gambar yang ingin dijadikan foto profil bot!\n\n' +
      'Contoh:\n' +
      '.setppbot'
    )
  }

  try {
    // Cek apakah pesan yang direply adalah gambar
    const mime = quoted.mimetype || quoted.msg?.mimetype || ''

    if (!mime.startsWith('image/')) {
      return m.reply(
        '❌ Yang kamu reply bukan gambar!\n\n' +
        '📸 Reply sebuah gambar lalu ketik *.setppbot*'
      )
    }

    await m.reply('⏳ Mengganti foto profil bot...')

    // Download gambar langsung dari quoted message
    const buffer = await quoted.download()

    if (!buffer || !buffer.length) {
      throw new Error('Gagal mengunduh gambar.')
    }

    const tmpDir = './tmp'

    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true })
    }

    const filePath = path.join(
      tmpDir,
      `ppbot-${Date.now()}.jpg`
    )

    fs.writeFileSync(filePath, buffer)

    // Nomor bot
    const botJid = conn.user?.id

    if (!botJid) {
      throw new Error('JID bot tidak ditemukan.')
    }

    // Update profile picture
    await conn.updateProfilePicture(botJid, {
      url: filePath
    })

    // Hapus file temporary
    try {
      fs.unlinkSync(filePath)
    } catch {}

    await m.reply('✅ Foto profil bot berhasil diganti!')
  } catch (e) {
    console.error('SET PPF BOT ERROR:', e)

    await m.reply(
      `❌ Gagal mengganti foto profil bot!\n\n` +
      `${e?.message || e}`
    )
  }
}

handler.help = ['setppbot']
handler.tags = ['owner']
handler.command = /^setppbot$/i
handler.owner = true

export default handler