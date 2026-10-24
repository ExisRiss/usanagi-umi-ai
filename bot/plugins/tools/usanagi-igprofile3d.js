/* By AlzRiss - Usanagi Umi AI */

import { downloadMediaBuffer, getMediaSource, react } from '../../lib/awang-media.js'
import {
  claimIgProfileMessage,
  endIgProfileJob,
  igProfileUsage,
  parseIgProfileInput,
  releaseIgProfileMessage,
  renderIgProfile3d,
  startIgProfileJob,
} from '../../lib/awang-igprofile3d.js'

function messageKey(m) {
  return `${String(m?.chat || m?.key?.remoteJid || '')}:${String(m?.key?.id || m?.id || '')}`
}

function publicInputError(code) {
  if (code === 'EMPTY') return 'Data profile belum diisi. Gunakan format contoh pada panduan.'
  if (code === 'LENGTH') return 'Ada input yang terlalu panjang. Ringkas teks lalu coba lagi.'
  return 'Format input belum sesuai. Gunakan tepat 10 bagian yang dipisahkan dengan tanda |.'
}

const handler = async (m, { rawConn, usedPrefix }) => {
  const input = String(m?.text || '').trim()
  if (!input) {
    await m.reply(igProfileUsage(usedPrefix))
    return { status: false }
  }

  const parsed = parseIgProfileInput(input)
  if (parsed.error) {
    await m.reply(`📸 *IGPROFILE3D*\n\n${publicInputError(parsed.error)}\n\n${igProfileUsage(usedPrefix)}`)
    return { status: false }
  }

  const source = getMediaSource(m, ['image'])
  if (!source) {
    await m.reply(`📷 Foto profile belum ditemukan.\nKirim gambar bersama command atau reply gambar lalu gunakan *${usedPrefix}igprofile3d*.`)
    return { status: false }
  }

  const requestKey = messageKey(m)
  const jobKey = String(m?.chat || m?.key?.remoteJid || '')
  if (!claimIgProfileMessage(requestKey)) return { status: false, duplicate: true }
  if (!startIgProfileJob(jobKey)) {
    releaseIgProfileMessage(requestKey)
    await m.reply('📸 *IGPROFILE3D*\n\n⏳ Masih ada proses yang berjalan di chat ini.\nTunggu sampai selesai lalu coba lagi.')
    return { status: false }
  }

  try {
    await react(rawConn, m, '🎨')
    await m.reply('📸 *IGPROFILE3D*\n\n✨ Sedang merender profile card.\nTunggu sebentar...')
    const sourceBuffer = await downloadMediaBuffer(source)
    if (!sourceBuffer?.length) throw Object.assign(new Error('Foto kosong.'), { code: 'MEDIA' })

    const result = await renderIgProfile3d(parsed.value, sourceBuffer)
    await rawConn.sendMessage(m.chat, {
      image: result.buffer,
      mimetype: result.mime,
      fileName: `Usanagi-IGProfile3D-${Date.now()}.png`,
      caption: '✅ *IGPROFILE3D SELESAI*\nProfile card berhasil dibuat.',
    }, { quoted: m.raw })
    await react(rawConn, m, '✅')
    return { status: true, width: result.width, height: result.height }
  } catch (error) {
    await react(rawConn, m, '❌')
    if (error?.code === 'MEDIA') await m.reply('📷 Foto profile tidak dapat dibaca. Kirim gambar lain lalu coba lagi.')
    else if (error?.code === 'IMAGE') await m.reply('🖼️ Foto profile tidak valid atau gagal diproses. Gunakan gambar JPG, PNG, atau WebP yang normal.')
    else if (error?.code === 'ASSET') await m.reply('⚠️ Asset IGProfile3D belum tersedia di project. Periksa file template fitur ini.')
    else if (error?.code === 'CANVAS') await m.reply('🎨 Render canvas gagal. Coba gunakan foto lain atau ulangi beberapa saat lagi.')
    else await m.reply('⚠️ IGProfile3D belum berhasil dibuat. Silakan coba lagi beberapa saat.')
    return { status: false }
  } finally {
    releaseIgProfileMessage(requestKey)
    endIgProfileJob(jobKey)
  }
}

handler.command = /^igprofile3d$/i
handler.help = ['igprofile3d']
handler.tags = ['tools']
handler.category = 'tools'
handler.description = 'Membuat Instagram Profile Card glassmorphism 3D berbasis foto dan data profile custom.'
handler.usage = '.igprofile3d USERNAME | BIO | FOLLOWERS | FOLLOWING | POSTS | TEXT 1 | TEXT 2 | DESKRIPSI | EMAIL | LINK'
handler.example = '.igprofile3d alzriss | AlzRiss | 8.7K | 420 | 98 | 🧭 Exploring ideas, creating stories. | 🎨 UI/UX Designer & Visual Storyteller | 🌐 Designing experiences that connect. | ✉️ hello@axcode.id | 🔗 axcode.id'
handler.limit = true
handler.premiumOnly = false

export default handler
