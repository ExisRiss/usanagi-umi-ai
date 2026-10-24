import fs from 'fs'
import archiver from 'archiver'
import path from 'path'

const handler = async (m, { conn }) => {
  try {
    const root = process.cwd()
    const tmpDir = path.join(root, 'tmp')
    const tmpFile = path.join(tmpDir, 'file')

    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })
    if (!fs.existsSync(tmpFile)) fs.writeFileSync(tmpFile, 'tmp active')

    await m.reply(`
🌸 *AlzRiss sedang menyiapkan backup...* 📦

Tunggu sebentar yaa~
Waku waku~ ✨
`.trim())

    const date = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Jakarta'
    })

    const backupName = `Usanagi-Umi-AI-${date}.zip`

    const output = fs.createWriteStream(backupName)
    const archive = archiver('zip', {
      zlib: { level: 9 }
    })

    archive.pipe(output)

    archive.glob('**/*', {
      cwd: root,
      ignore: [
        'node_modules/**',
        'sessions/**',
        '.npm/**',
        backupName
      ]
    })

    archive.directory(tmpDir, 'tmp')

    output.on('close', async () => {
      try {
        const groupLink = global.backupGroupLink // 🔥 pakai link grup atau JID

        if (!groupLink) {
          return m.reply('❌ Belum ada global.backupGroupLink di config.js')
        }

        let groupJid = ''

        // Deteksi apakah global variable berupa JID langsung atau link invite
        if (groupLink.endsWith('@g.us')) {
          groupJid = groupLink
        } else {
          // Ambil kode invite menggunakan Regex agar bersih dari parameter URL
          const match = groupLink.match(/chat\.whatsapp\.com\/([\w\d]+)/i)
          const code = match ? match[1] : groupLink.split('/').pop()

          try {
            const data = await conn.groupGetInviteInfo(code)
            groupJid = data.id
          } catch (fetchErr) {
            console.error(fetchErr)
            fs.existsSync(backupName) && fs.unlinkSync(backupName)
            return m.reply('❌ Gagal mengambil ID grup. Pastikan link invite masih valid atau gunakan Group JID secara langsung di config.')
          }
        }

        const size = (archive.pointer() / 1024 / 1024).toFixed(2)

        const caption = `
🌸 *USANAGI UMI AI BACKUP*

Waku waku~! 👀✨

📁 *File* : ${backupName}
📦 *Ukuran* : ${size} MB
📅 *Tanggal* : ${date}

Backup berhasil dibuat oleh AlzRiss! 🥜💕
`.trim()

        await conn.sendFile(
          groupJid,
          backupName,
          backupName,
          caption
        )

        await m.reply(`
✅ *Backup berhasil dikirim ke grup!*

🌸 AlzRiss sudah selesai~ ✨
`.trim())

        fs.existsSync(backupName) && fs.unlinkSync(backupName)
      } catch (e) {
        console.error(e)
        fs.existsSync(backupName) && fs.unlinkSync(backupName)
        m.reply('❌ Gagal kirim ke grup. Pastikan bot sudah menjadi member di dalam grup tersebut.')
      }
    })

    archive.finalize()

  } catch (e) {
    console.error(e)
    m.reply(`
❌ *Backup gagal!*

📄 Error:
${e.message}

AlzRiss sedih... 🥺
`.trim())
  }
}

handler.help = ['backup']
handler.tags = ['owner']
handler.command = /^backup$/i
handler.owner = true

export default handler