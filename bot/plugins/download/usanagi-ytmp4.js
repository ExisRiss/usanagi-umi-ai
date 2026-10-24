/* By AlzRiss - Usanagi Umi AI */

import fs from 'fs-extra'
import { downloadYoutube, isYoutubeUrl } from '../../lib/youtube-media.js'

// Dibatasi 80 MB: WhatsApp menolak media besar dan disk container pernah penuh
// (ENOSPC) saat unduhan 200 MB menumpuk di /tmp.
const MAX_VIDEO = 80 * 1024 * 1024

async function react(conn, m, emoji) {
  try {
    await conn.sendMessage(m.chat, { react: { text: emoji, key: m.raw.key } })
  } catch {}
}

const handler = async (m, { conn, usedPrefix }) => {
  const input = m.text?.trim()

  if (!input) {
    m.limit?.fail()
    return conn.sendMessage(m.chat, {
      text: `❌ Masukkan link YouTube!\n\nContoh:\n${usedPrefix}ytmp4 https://youtu.be/xxxxx`
    }, { quoted: m.raw })
  }

  if (!isYoutubeUrl(input)) {
    m.limit?.fail()
    return conn.sendMessage(m.chat, { text: '❌ Link tersebut bukan link YouTube.' }, { quoted: m.raw })
  }

  void react(conn, m, '⏳')

  let file = null
  try {
    // API api-faa dilepas: URL bertanda tangan dari layanan itu selalu dijawab
    // 403 saat diunduh dari IP server (token terikat IP pemanggil API).
    const media = await downloadYoutube(input, { type: 'video', maxBytes: MAX_VIDEO, prefix: 'usanagi-ytmp4' })
    file = media.file

    await conn.sendMessage(m.chat, {
      video: { url: file },
      mimetype: 'video/mp4',
      fileName: 'youtube.mp4'
    }, { quoted: m.raw })

    await react(conn, m, '✅')
    m.limit?.success()
  } catch (error) {
    m.limit?.fail()
    console.error('[USANAGI YTMP4 ERROR]', error.message)
    await react(conn, m, '❌')
    await conn.sendMessage(m.chat, {
      text: `❌ Gagal mendownload video YouTube.\n\n${error.message}`
    }, { quoted: m.raw })
    throw error
  } finally {
    if (file) await fs.remove(file).catch(() => {})
  }
}

handler.command = /^(ytmp4|ytv|ytvideo|ytmp4dl)$/i
handler.help = ['ytmp4', 'ytv']
handler.tags = ['download']
handler.description = 'Download video YouTube MP4'
handler.limitCommit = 'manual'

export default handler
