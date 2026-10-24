/* By AlzRiss - Usanagi Umi AI */

import { downloadMediaBuffer, getMediaSource, getMimeType, react } from '../../lib/awang-media.js'
import {
  getStoryVideoUsage,
  renderStoryVideo,
  parseArgs,
  makeStoryJobKey,
  makeStoryMessageKey,
  startStoryVideoJob,
  endStoryVideoJob,
  claimStoryMessage,
} from '../../lib/awang-engine.js'

const handler = async (m, { rawConn, usedPrefix }) => {
  const input = String(m.text || '').trim()
  if (!input) {
    await m.reply(getStoryVideoUsage(usedPrefix))
    return { status: false }
  }

  const parsed = parseArgs(input)
  if (!parsed.text) {
    await m.reply(getStoryVideoUsage(usedPrefix))
    return { status: false }
  }

  const requestKey = makeStoryMessageKey(m)
  const jobKey = makeStoryJobKey(m)
  if (!claimStoryMessage(requestKey)) return { status: false, duplicate: true }

  if (!startStoryVideoJob(jobKey)) {
    await m.reply('🎬 *STORYVIDEO*\n\n⏳ *Masih diproses*\n• Tunggu render sebelumnya selesai.')
    return { status: false }
  }

  try {
    const source = getMediaSource(m, ['video'])
    react(rawConn, m, '🎬').catch(() => {})
    await m.reply(source
      ? '🎬 *STORYVIDEO*\n\n✨ *Sedang diproses*\n• Video + typography\n• Motion + frame\n\n⏳ Tunggu sampai selesai.'
      : '🎬 *STORYVIDEO*\n\n✨ *Sedang dirender*\n• Typography + frame\n• Motion aesthetic\n\n⏳ Tunggu sampai selesai.')

    let sourceBuffer = null
    let sourceMime = 'video/mp4'
    if (source) {
      sourceMime = getMimeType(source, 'video/mp4')
      sourceBuffer = await downloadMediaBuffer(source)
      if (!sourceBuffer?.length) {
        throw Object.assign(new Error('Video sumber kosong.'), {
          code: 'MEDIA',
          publicMessage: '⚠️ Video sumber tidak bisa dibaca. Coba kirim video lain.',
        })
      }
    }

    const result = await renderStoryVideo(parsed.text, parsed.options, sourceBuffer, sourceMime)
    const caption = `🎬 *STORYVIDEO*\n✨ ${result.styleName} · ${(result.durationMs / 1000).toFixed(1)}s`

    await rawConn.sendMessage(m.chat, {
      video: result.buffer,
      mimetype: 'video/mp4',
      fileName: `Usanagi-StoryVideo-${Date.now()}.mp4`,
      caption,
    }, { quoted: m.raw })

    react(rawConn, m, '✅').catch(() => {})
    return { status: true, scenes: result.scenes, style: result.styleName, usedSourceVideo: result.usedSourceVideo }
  } catch (error) {
    react(rawConn, m, '❌').catch(() => {})
    await m.reply(error?.publicMessage || '⚠️ *STORYVIDEO*\n\n• Render belum berhasil.\n• Coba ulangi sekali lagi.')
    return { status: false }
  } finally {
    endStoryVideoJob(jobKey)
  }
}

handler.command = /^(storyvideo|storyvid|storyquote|quotevideo)$/i
handler.help = ['storyvideo', 'storyvid', 'storyquote', 'quotevideo']
handler.tags = ['tools']
handler.category = 'tools'
handler.description = 'Membuat video quote typography atau memasang quote ke video yang dikirim.'
handler.usage = '.storyvideo <nama> | <text1>, <text2>, <text3> | <The>'
handler.example = '.storyvideo AWANG OFC | Engine, Nature, Escape'
handler.limit = true
handler.premiumOnly = false

export default handler
