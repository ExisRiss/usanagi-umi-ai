import { AIArtClient, IMAGE_MODELS, parseArgs, getModel } from '../../lib/aiart.js'

const client = new AIArtClient()

let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {

    if (!text) {
      return m.reply(
`🎨 *AI Art Generator*

Contoh:

${usedPrefix + command} anime girl

Model:
${usedPrefix + command} cat --model=raemu_lighting

Ratio:
${usedPrefix + command} cat --ratio=1:1

Gabungan:
${usedPrefix + command} beautiful elf --model=flux2_klein --ratio=9:16

Daftar Model:

${IMAGE_MODELS.map(v => `• ${v.id}`).join('\n')}`
      )
    }

    await m.react('🎨')

    const opt = parseArgs(text)

    if (!opt.prompt)
      throw new Error('Prompt kosong.')

    const model = getModel(opt.model)

    const progressMsg = await conn.reply(
      m.chat,
`🎨 *AI Art Generator*

📝 Prompt:
${opt.prompt}

🤖 Model:
${model.name}

📐 Ratio:
${opt.ratio}

⏳ Progress:
0%`,
      m
    )

    let lastProgress = -1

    const result = await client.generateImage(
      opt.prompt,
      {
        model: model.id,
        ratio: opt.ratio,
        negativePrompt: opt.negativePrompt
      },
      async (_, progress) => {

        if (progress === lastProgress)
          return

        lastProgress = progress

        try {

          await conn.sendMessage(
            m.chat,
            {
              text:
`🎨 *AI Art Generator*

📝 ${opt.prompt}

🤖 ${model.name}

📐 ${opt.ratio}

⏳ ${progress}%`,
              edit: progressMsg.key
            }
          )

        } catch {}

      }
    )

    const images =
      result.images ||
      result.data ||
      result.result ||
      []

    if (!images.length)
      throw new Error(
        'Image URL tidak ditemukan.'
      )

    for (const img of images) {

      const url =
        img.url ||
        img.image ||
        img.image_url ||
        img.output ||
        img

      await conn.sendFile(
        m.chat,
        url,
        'aiart.jpg',
`✨ *Generate Success*

📝 Prompt:
${opt.prompt}

🤖 Model:
${model.name}

📐 Ratio:
${opt.ratio}`,
        m
      )

    }

    await m.react('✅')

  } catch (e) {

    console.error(e)

    await m.react('❌')

    m.reply(
`❌ Error

${e.message}`
    )

  }

}

handler.help = ['aiimg <prompt>']
handler.tags = ['ai']
handler.command = /^(aiimg|txt2img)$/i

handler.limit = 5

export default handler