import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import { tmpdir } from 'os'

const handler = async (m, { conn, usedPrefix, command }) => {
  const quoted = m.quoted ? m.quoted : m
  const mime = (quoted.msg || quoted).mimetype || ''
  const isMedia = /video|audio/.test(mime)

  if (!isMedia) {
    return m.reply(`Balas pesan video/audio dengan caption *${usedPrefix + command}*`)
  }

  m.reply("tunggu sebentar ")

  try {
    const inputPath = path.join(tmpdir(), `${Date.now()}_input`)
    const outputPath = path.join(tmpdir(), `${Date.now()}_output.mp3`)

    const buffer = await quoted.download()
    fs.writeFileSync(inputPath, buffer)

    await new Promise((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', ['-i', inputPath, '-vn', '-ab', '128k', '-ar', '44100', '-y', outputPath])
      ffmpeg.on('close', (code) => {
        if (code === 0) resolve()
        else reject(new Error(`ffmpeg gagal dengan kode ${code}`))
      })
    })

    await conn.sendMessage(m.chat, {
      audio: { url: outputPath },
      mimetype: 'audio/mpeg',
      ptt: false
    }, { quoted: m })

    fs.unlinkSync(inputPath)
    fs.unlinkSync(outputPath)
  } catch (err) {
    console.error(err)
    m.reply('Terjadi error saat mengonversi ke MP3.')
  }
}

handler.command = ['tomp3', 'mp3','toaudio']
handler.tags = ['tools']
handler.help = ["tomp3"]

export default handler