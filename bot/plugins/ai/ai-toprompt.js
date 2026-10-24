import sharp from 'sharp'

const headers = {
  origin: 'https://imageprompt.org',
  referer: 'https://imageprompt.org/image-to-prompt',
  accept: '*/*',
  'user-agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36'
}

async function toPrompt(buffer) {
  const image = await sharp(buffer)
    .resize({
      width: 1024,
      withoutEnlargement: true
    })
    .webp({
      quality: 85
    })
    .toBuffer()

  const { cache } = await fetch('https://s.imageprompt.org/api/send', {
    method: 'POST',
    headers: {
      ...headers,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      type: 'event',
      payload: {
        website: 'fddb9311-c53c-40fc-85ff-5f0c43971d90',
        screen: '1280x800',
        language: 'en-US',
        title: 'Free Image to Prompt Generator | ImagePrompt.org',
        hostname: 'imageprompt.org',
        url: 'https://imageprompt.org/image-to-prompt',
        referrer: '',
        name: 'image_to_prompt',
        data: {
          props: {
            image_model: 0,
            prompt_language: 'en'
          }
        }
      }
    })
  }).then(res => res.json())

  return await fetch('https://imageprompt.org/api/ai/prompts/image', {
    method: 'POST',
    headers: {
      ...headers,
      'content-type': 'application/json',
      'x-umami-cache': cache
    },
    body: JSON.stringify({
      base64Url: `data:image/webp;base64,${image.toString('base64')}`
    })
  }).then(res => res.json())
}

const handler = async (m, { conn, text }) => {
  try {
    let buffer

    if (m.quoted && /image/.test(m.quoted.mimetype || '')) {
      buffer = await m.quoted.download()
    } else if (m.msg?.mimetype?.startsWith('image/')) {
      buffer = await m.download()
    } else if (text) {
      const res = await fetch(text)
      if (!res.ok) throw 'URL gambar tidak valid.'
      buffer = Buffer.from(await res.arrayBuffer())
    } else {
      throw `Reply gambar atau kirim URL gambar.

Contoh:
.imageprompt
.imageprompt https://example.com/image.jpg`
    }

    await m.reply('⏳ Sedang menganalisis gambar...')

    const result = await toPrompt(buffer)

    if (!result?.prompt)
      throw result?.message || 'Prompt tidak ditemukan.'

    const caption = `
╭━━━〔 🖼️ Image Prompt 〕━━⬣

${result.prompt}

╰━━━━━━━━━━━━━━━━⬣
`.trim()

    await conn.reply(m.chat, caption, m)
  } catch (e) {
    console.error(e)
    m.reply(`❌ Error:\n${e.message || e}`)
  }
}

handler.help = ['imageprompt']
handler.tags = ['ai']
handler.command = ['imageprompt', 'imgprompt', 'toprompt']
handler.limit = true

export default handler