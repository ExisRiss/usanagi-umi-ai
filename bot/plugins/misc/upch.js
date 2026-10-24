import fs from 'fs'
import path from 'path'
import crypto from 'node:crypto'
import ffmpeg from 'fluent-ffmpeg'
import { tmpdir } from 'os'
import { downloadContentFromMessage } from '@rexxhayanasi/elaina-baileys'
import { getFfmpegBinPath } from '../../lib/awang-ytdlp.js'

let ffmpegPathReady = false

async function streamToBuffer(stream) {
  const chunks = []
  for await (const chunk of stream) chunks.push(chunk)
  return Buffer.concat(chunks)
}

async function ensureFfmpegPath() {
  if (ffmpegPathReady) return
  const bin = await getFfmpegBinPath()
  if (bin) ffmpeg.setFfmpegPath(bin)
  ffmpegPathReady = true
}

async function convertToOpus(input, output) {
  await ensureFfmpegPath()

  return new Promise((resolve, reject) => {
    ffmpeg(input)
      .noVideo()
      .audioCodec('libopus')
      .audioFrequency(48000)
      .audioChannels(1)
      .audioBitrate('64k')
      .format('ogg')
      .outputOptions([
        '-map 0:a:0?',
        '-application audio',
        '-vbr on',
        '-compression_level 10',
      ])
      .on('end', resolve)
      .on('error', reject)
      .save(output)
  })
}

function safeErrorSummary(error) {
  return String(error?.message || error || 'unknown error')
    .replace(/https?:\/\/\S+/gi, '<url>')
    .replace(/\b\d{7,}\b/g, '<id>')
    .replace(/\s+/g, ' ')
    .slice(0, 180)
}

function uploadChannelRole(metadata) {
  return String(
    metadata?.viewer_metadata?.role
    || metadata?.viewerMetadata?.role
    || metadata?.role
    || ''
  ).trim().toUpperCase()
}

async function uploadChannelFor(conn) {
  const jadibot = conn?.botConfig?.type === 'jadibot'
  const channelId = String(
    jadibot
      ? conn?.botConfig?.values?.links?.upchChannelId
      : global.links?.channelId
      || ''
  ).trim()

  if (!channelId.endsWith('@newsletter')) {
    const error = new Error(
      jadibot
        ? 'Channel Utama belum diatur. Buka Website Jadibot → Settings → Channel Utama /upch, lalu simpan link Channel.'
        : 'Channel utama bot belum dikonfigurasi oleh owner bot.'
    )
    error.userVisible = true
    throw error
  }

  if (jadibot) {
    if (typeof conn.newsletterMetadata !== 'function') {
      const error = new Error('Koneksi Jadibot belum siap memeriksa status admin Channel. Coba lagi setelah bot terhubung.')
      error.userVisible = true
      throw error
    }
    let metadata
    try {
      metadata = await Promise.race([
        conn.newsletterMetadata('jid', channelId),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 12000)),
      ])
    } catch {
      const error = new Error('Status Channel Utama tidak dapat diverifikasi. Pastikan Jadibot masih mengikuti Channel tersebut.')
      error.userVisible = true
      throw error
    }
    if (!['OWNER', 'ADMIN'].includes(uploadChannelRole(metadata))) {
      const error = new Error('Jadibot bukan admin Channel Utama. Jadikan bot admin Channel tersebut, lalu coba lagi.')
      error.userVisible = true
      throw error
    }
  }

  return channelId
}

let handler = async (m, { conn, usedPrefix, command }) => {
  const quoted =
    m.message?.extendedTextMessage
      ?.contextInfo
      ?.quotedMessage

  if (!quoted) {
    return m.reply(
      `❌ Reply media terlebih dahulu!\n\n` +
      `Contoh:\n${usedPrefix + command}`
    )
  }

  let channelId
  try {
    channelId = await uploadChannelFor(conn)
  } catch (error) {
    return m.reply(`❌ ${error?.userVisible ? error.message : 'Channel tujuan belum siap. Coba lagi nanti.'}`)
  }

  let media = null
  let type = ''
  let mimetype = ''

  const caption =
    quoted.imageMessage?.caption ||
    quoted.videoMessage?.caption ||
    m.quoted?.text ||
    ''

  if (quoted.imageMessage) {
    media = quoted.imageMessage
    type = 'image'
    mimetype = media.mimetype
  } else if (quoted.videoMessage) {
    media = quoted.videoMessage
    type = media.ptv ? 'ptv' : 'video'
    mimetype = media.mimetype
  } else if (quoted.audioMessage) {
    media = quoted.audioMessage
    type = 'audio'
    mimetype = media.mimetype
  } else if (quoted.stickerMessage) {
    media = quoted.stickerMessage
    type = 'sticker'
    mimetype = 'image/webp'
  }

  if (!media) return m.reply('❌ Media tidak didukung!')

  const ext = mimetype?.split('/')[1]?.split(';')[0]?.replace(/[^a-z0-9]/gi, '') || 'bin'
  const filename = `${Date.now()}-${crypto.randomBytes(5).toString('hex')}`
  const inputPath = path.join(tmpdir(), `${filename}.${ext}`)
  const opusPath = path.join(tmpdir(), `${filename}.ogg`)

  try {
    await m.reply(`🔄 Sedang memproses ${type}...`)

    const stream = await downloadContentFromMessage(
      media,
      type === 'image' ? 'image' : type === 'video' || type === 'ptv' ? 'video' : type === 'audio' ? 'audio' : 'sticker'
    )
    const buffer = await streamToBuffer(stream)
    if (!buffer.length) throw new Error('Media kosong atau tidak dapat diunduh.')
    fs.writeFileSync(inputPath, buffer)

    switch (type) {
      case 'image':
        await conn.sendMessage(channelId, { image: buffer, caption })
        break
      case 'video':
        await conn.sendMessage(channelId, { video: buffer, caption })
        break
      case 'ptv':
        await conn.sendMessage(channelId, { video: buffer, ptv: true, caption })
        break
      case 'sticker':
        await conn.sendMessage(channelId, { sticker: buffer })
        break
      case 'audio': {
        // `audio/ogg` is not always Opus (it may be Vorbis), so only copy when
        // the MIME explicitly says Opus. All other audio is normalized safely.
        const isOpus = /opus/i.test(mimetype || '')
        let sentAsVoiceNote = isOpus

        if (isOpus) {
          fs.copyFileSync(inputPath, opusPath)
        } else {
          try {
            await convertToOpus(inputPath, opusPath)
            sentAsVoiceNote = true
          } catch (conversionError) {
            // Do not fail the entire channel upload just because the server
            // cannot encode this input. The original audio is still delivered.
            sentAsVoiceNote = false
            console.warn(`[upch] Opus conversion fallback: ${safeErrorSummary(conversionError)}`)
          }
        }

        if (sentAsVoiceNote) {
          await conn.sendMessage(channelId, {
            audio: fs.readFileSync(opusPath),
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true,
          })
        } else {
          await conn.sendMessage(channelId, {
            audio: buffer,
            mimetype: mimetype || 'audio/mpeg',
            ptt: false,
          })
        }
        break
      }
    }

    await m.reply(`✅ ${type} berhasil diupload ke channel!`)
  } catch (error) {
    console.warn(`[upch] upload failed: ${safeErrorSummary(error)}`)
    await m.reply('❌ Gagal mengupload media ke channel. Pastikan media masih valid lalu coba lagi.')
  } finally {
    await fs.promises.rm(inputPath, { force: true }).catch(() => {})
    await fs.promises.rm(opusPath, { force: true }).catch(() => {})
  }
}

handler.help = ['upch']
handler.tags = ['owner']
handler.command = /^(upch|sendch)$/i
handler.owner = true

export default handler
