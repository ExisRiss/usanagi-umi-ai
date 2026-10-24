
import { transcodeBuffer } from '../../lib/awang-ffmpeg.js'
import { downloadMediaBuffer, getMediaSource, react } from '../../lib/awang-media.js'

const handler = async (m, { rawConn, usedPrefix }) => {
  const source = getMediaSource(m, ['video', 'audio'])
  if (!source) {
    await m.reply(`💬 Reply video atau voice note lalu ketik *${usedPrefix}toaudio*.`)
    return
  }

  const isVideo = source.type === 'video'
  const isPtt = source.type === 'audio' && source.message?.ptt === true
  if (!isVideo && !isPtt) {
    await m.reply('❌ Media sudah berupa audio biasa. Gunakan video atau voice note.')
    return
  }

  await react(rawConn, m, '🕕')
  try {
    const input = await downloadMediaBuffer(source)
    const output = await transcodeBuffer(input, isVideo ? 'mp4' : 'ogg', 'mp3', {
      outputOptions: ['-vn', '-ar', '44100', '-ac', '2', '-b:a', '192k'],
      timeoutMs: 120000,
    })

    await rawConn.sendMessage(m.chat, {
      audio: output,
      mimetype: 'audio/mpeg',
      fileName: 'Usanagi-Audio.mp3',
    }, { quoted: m.raw })
    await react(rawConn, m, '✅')
    return { status: true }
  } catch (error) {
    await react(rawConn, m, '❌')
    throw new Error(`Toaudio gagal: ${error?.message || 'proses tidak tersedia'}`)
  }
}

handler.command = /^(toaudio|tomp3|videotoaudio|extractaudio)$/i
handler.help = ['toaudio', 'tomp3', 'videotoaudio', 'extractaudio']
handler.tags = ['tools']
handler.category = 'tools'
handler.description = 'Mengubah video atau voice note menjadi audio MP3.'
handler.usage = '.toaudio (reply video/vn)'
handler.example = '.toaudio'
handler.limit = false
handler.premiumOnly = false

export default handler
