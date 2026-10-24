/* By AlzRiss - Usanagi Umi AI */

import axios from 'axios'
import FormData from 'form-data'

const handler = async (m, { usedPrefix, command }) => {
  const mime = String(m.quoted?.mimetype || m.quoted?.msg?.mimetype || '')
  if (!m.quoted?.download || !/^image\/(?:jpe?g|png|webp)$/i.test(mime)) {
    return m.reply(`Reply gambar JPG, PNG, atau WebP.\n\nContoh: ${usedPrefix}${command}`)
  }
  await m.react?.('⏳')
  try {
    const image = await m.quoted.download()
    if (!image?.length) throw new Error('Gambar gagal diunduh.')
    if (image.length > 8 * 1024 * 1024) throw new Error('Ukuran gambar maksimal 8 MB.')

    const form = new FormData()
    form.append('file', image, { filename: 'image.jpg', contentType: mime })
    const upload = await axios.post('https://tmpfiles.org/api/v1/upload', form, {
      headers: form.getHeaders(),
      timeout: 30000,
      maxBodyLength: 10 * 1024 * 1024,
    })
    const publicUrl = String(upload.data?.data?.url || '').replace('tmpfiles.org/', 'tmpfiles.org/dl/')
    if (!publicUrl) throw new Error('Upload gambar gagal.')

    const response = await axios.get(`https://api.deline.web.id/ai/toprompt?url=${encodeURIComponent(publicUrl)}`, { timeout: 45000 })
    const result = response.data?.result
    if (!response.data?.status || !result) throw new Error('Layanan analisis tidak memberikan hasil.')

    await m.reply([
      '🎨 *IMAGE TO PROMPT*',
      '',
      '🧠 *Prompt asli:*',
      result.original || '-',
      '',
      '🌐 *Terjemahan Indonesia:*',
      result.translated || '-',
      '',
      '_Catatan privasi: gambar diproses melalui layanan pihak ketiga._',
      'By AlzRiss - Usanagi Umi AI',
    ].join('\n'))
    await m.react?.('✅')
  } catch (error) {
    console.error('[IMG2PROMPT]', error.message)
    await m.react?.('❌')
    return m.reply(`Image to prompt gagal: ${error.message}`)
  }
}

handler.command = /^(toprompt|img2prompt|imagetoprompt)$/i
handler.help = ['img2prompt <reply gambar>']
handler.tags = ['ai']
handler.limit = true
handler.description = 'Menganalisis gambar menjadi prompt deskriptif'

export default handler
