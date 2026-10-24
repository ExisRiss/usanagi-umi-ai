import { AIArtClient, VIDEO_ENGINES } from '../../lib/aiart.js'
import uploadImage from '../../lib/uploadImage.js'

const client = new AIArtClient()

let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {

    let imageUrl = ''

    if (m.quoted) {

      const mime =
        (m.quoted.msg || m.quoted).mimetype || ''

      if (/image/i.test(mime)) {

        const media = await m.quoted.download()

        imageUrl = await (await import('../../lib/uploadImage.js'))
          .then(v => v.default(media))

      }

    }

    if (!text && !imageUrl) {
      return m.reply(
`🎬 *AI Video Generator*

Text → Video

${usedPrefix + command} beautiful waterfall

Reply Gambar

${usedPrefix + command} make it move

Engine

--engine=wan
--engine=hunyuan
--engine=ltx2

Durasi

--duration=5
--duration=10
--duration=20`
      )
    }

    await m.react('🎬')

    let engine = 'wan'
    let duration = 5

    const args = text.split(/\s+/)
    const prompt = []

    for (const arg of args) {

      if (arg.startsWith('--engine=')) {
        engine = arg.slice(9)
        continue
      }

      if (arg.startsWith('--duration=')) {
        duration = Number(arg.slice(11)) || 5
        continue
      }

      prompt.push(arg)

    }

    const engineInfo =
      VIDEO_ENGINES[engine] ||
      VIDEO_ENGINES.wan

    const msg = await conn.reply(
      m.chat,
`🎬 *AI Video Generator*

📝 ${prompt.join(' ') || '-'}

⚙️ ${engineInfo.name}

⏳ Progress : 0%`,
      m
    )

    let last = -1

    const result =
      await client.generateVideo(
        prompt.join(' '),
        {
          engine,
          duration,
          imageUrl
        },
        async (_, progress) => {

          if (progress === last)
            return

          last = progress

          try {

            await conn.sendMessage(
              m.chat,
              {
                text:
`🎬 AI Video

⚙️ ${engineInfo.name}

📊 ${progress}%`,
                edit: msg.key
              }
            )

          } catch {}

        }
      )

    const video =
      result.video_url ||
      result.url ||
      result.output ||
      result.result?.video_url ||
      result.result?.url

    if (!video)
      throw new Error(
        'Video tidak ditemukan.'
      )

    await conn.sendFile(
      m.chat,
      video,
      'ai-video.mp4',
`✅ *Video Berhasil Dibuat*

📝 Prompt :
${prompt.join(' ') || '-'}

🎬 Engine :
${engineInfo.name}

⏱️ Durasi :
${duration} detik`,
      m,
      false,
      {
        mimetype: 'video/mp4'
      }
    )

    await m.react('✅')

  } catch (e) {

    console.error(e)

    await m.react('❌')

    m.reply(
`Terjadi kesalahan.

${e.message}`
    )

  }

}

handler.help = [
  'aivid <prompt>',
  'aivid (reply image)'
]

handler.tags = ['ai']

handler.command = /^(aivid|txt2vid|img2vid)$/i

handler.limit = 8

export default handler