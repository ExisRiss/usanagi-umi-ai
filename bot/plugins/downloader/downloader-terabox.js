/**
 * /terabox — baca share link TeraBox & unduh file.
 *
 * Ditulis ulang (Okt 2026). Versi lama bergantung pada `terabxdownloader.org`
 * yang sudah mati (HTTP 500), jadi perintah ini selalu gagal.
 *
 * Perilaku sekarang:
 *   - Sumber data: API resmi TeraBox (lihat lib/terabox.js), bukan situs pihak ketiga.
 *   - Tanpa cookie akun: tetap bisa membaca isi folder (nama + ukuran file) dan
 *     memberi penjelasan jujur bahwa link unduhan TeraBox butuh login.
 *   - Dengan cookie akun (owner: `/tbcookie set <cookie>`): file bisa diunduh
 *     dan dikirim, selama ukurannya di bawah batas platform.
 */
import {
  parseTeraBoxUrl,
  resolveTeraBoxShare,
  teraboxDirectLink,
  teraboxCookie,
  TERABOX_NOT_CONFIGURED,
} from '../../lib/terabox.js'

const TELEGRAM_MAX_BYTES = 45 * 1024 * 1024
const MAX_FILES_SENT = 3
const MAX_LISTED = 12

const isTelegram = (m) => Boolean(m?.__telegram) || /^999\d+@s\.whatsapp\.net$/.test(String(m?.sender || m?.chat || ''))

export function formatBytes(bytes) {
  const value = Number(bytes) || 0
  if (value <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const index = Math.min(units.length - 1, Math.floor(Math.log(value) / Math.log(1024)))
  const size = value / (1024 ** index)
  return `${size >= 10 || index === 0 ? size.toFixed(0) : size.toFixed(1)} ${units[index]}`
}

export function mediaKind(name) {
  const lower = String(name || '').toLowerCase()
  if (/\.(mp4|mkv|mov|avi|webm|flv|ts|m4v)$/.test(lower)) return 'video'
  if (/\.(jpg|jpeg|png|gif|webp|bmp)$/.test(lower)) return 'image'
  if (/\.(mp3|m4a|wav|flac|aac|ogg|opus)$/.test(lower)) return 'audio'
  return 'document'
}

function listText(share, limit = MAX_LISTED) {
  const lines = []
  const files = share.files.slice(0, limit)
  files.forEach((file, index) => {
    lines.push(`${index + 1}. ${file.name} — ${formatBytes(file.size)}`)
  })
  if (share.files.length > limit) lines.push(`…dan ${share.files.length - limit} file lain`)
  if (!share.files.length && share.folders.length) lines.push('(isi folder kosong atau tidak terbaca)')
  return lines.join('\n')
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const prefix = usedPrefix || '/'
  const input = String(text || '').trim()
  if (!input) {
    return m.reply([
      '📦 *TeraBox Downloader*',
      '',
      `Kirim link share TeraBox, contoh:`,
      `${prefix}${command} https://www.terabox.app/wap/share/filelist?surl=xxxx`,
      `${prefix}${command} https://1024terabox.com/s/1xxxx`,
      `${prefix}${command} <link> 2   ← kirim file nomor 2 saja`,
    ].join('\n'))
  }

  // Link + nomor file yang diminta (opsional).
  const match = input.match(/^(.*?)(?:\s+(\d{1,3}))?$/)
  const linkPart = String(match?.[1] || input).trim()
  const wanted = match?.[2] ? Number(match[2]) : null

  let parsed
  try {
    parsed = parseTeraBoxUrl(linkPart)
  } catch (error) {
    return m.reply(`❌ ${error.message}`)
  }

  await m.reply('⏳ Membaca link TeraBox…')

  let share
  try {
    share = await resolveTeraBoxShare(parsed, { timeoutMs: 12000, maxItems: 300, maxDepth: 3 })
  } catch (error) {
    return m.reply(`❌ Gagal membaca link TeraBox.\n${String(error?.message || error).slice(0, 300)}`)
  }

  if (!share.files.length && !share.folders.length) {
    return m.reply('❌ Tidak ada file di link itu. Pastikan link masih aktif dan bukan link dengan password.')
  }

  const cookieReady = Boolean(teraboxCookie())
  const header = [
    `📦 *${share.title}*`,
    `📄 ${share.files.length} file${share.folders.length ? ` · 📁 ${share.folders.length} folder` : ''} · total ${formatBytes(share.totalSize)}`,
    '',
    listText(share),
  ].join('\n')

  if (!share.files.length) {
    return m.reply(`${header}\n\n⚠️ Folder terbaca, tetapi tidak ada file yang bisa diambil di dalamnya.`)
  }

  // Tanpa cookie akun: TeraBox memang tidak memberi link unduhan.
  if (!cookieReady) {
    return m.reply([
      header,
      '',
      '⚠️ *Link unduhan TeraBox butuh akun.*',
      'TeraBox memblokir unduhan anonim (tombol Download di situsnya sendiri pun memunculkan Login).',
      'Isi daftar file di atas tetap nyata, dibaca langsung dari API TeraBox.',
      '',
      `Agar bot bisa mengirim filenya, owner cukup memasang cookie akun TeraBox (gratis):`,
      `${prefix}tbcookie set <cookie>`,
      'Cara ambil: buka terabox.com di browser → login → DevTools → Application → Cookies → salin nilai `ndus`.',
    ].join('\n'))
  }

  const maxBytes = Number(globalThis.umiTerabox?.maxSendBytes) || (isTelegram(m) ? TELEGRAM_MAX_BYTES : 90 * 1024 * 1024)
  const candidates = (wanted ? [share.files[wanted - 1]].filter(Boolean) : share.files)
    .slice(0, MAX_FILES_SENT)

  if (wanted && !share.files[wanted - 1]) {
    return m.reply(`${header}\n\n❌ File nomor ${wanted} tidak ada. Link ini punya ${share.files.length} file.`)
  }

  const sent = []
  const failed = []
  for (const file of candidates) {
    if (file.size > maxBytes) {
      failed.push(`• ${file.name} (${formatBytes(file.size)}) terlalu besar — batas ${formatBytes(maxBytes)}`)
      continue
    }
    try {
      const direct = await teraboxDirectLink(share, file)
      const kind = mediaKind(file.name)
      const caption = `📦 ${file.name}\n📏 ${formatBytes(file.size)}`
      if (kind === 'video') {
        await conn.sendMessage(m.chat, { video: { url: direct }, caption, mimetype: 'video/mp4' }, { quoted: m })
      } else if (kind === 'image') {
        await conn.sendMessage(m.chat, { image: { url: direct }, caption }, { quoted: m })
      } else if (kind === 'audio') {
        await conn.sendMessage(m.chat, { audio: { url: direct }, mimetype: 'audio/mpeg', fileName: file.name }, { quoted: m })
      } else {
        await conn.sendMessage(m.chat, { document: { url: direct }, fileName: file.name, mimetype: 'application/octet-stream' }, { quoted: m })
      }
      sent.push(file)
    } catch (error) {
      if (error?.code === TERABOX_NOT_CONFIGURED) {
        return m.reply([
          header,
          '',
          '⚠️ Cookie TeraBox tidak berlaku lagi.',
          String(error?.message || error).slice(0, 200),
          'Perbarui dengan: ' + prefix + 'tbcookie set <cookie>',
        ].join('\n'))
      }
      failed.push(`• ${file.name}: ${String(error?.message || error).slice(0, 120)}`)
    }
  }

  if (!sent.length) {
    return m.reply([
      header,
      '',
      '⚠️ File tidak bisa dikirim.',
      ...failed,
    ].join('\n'))
  }

  const lines = [`✅ Terkirim ${sent.length} file dari *${share.title}*.`]
  if (failed.length) lines.push('', 'Sebagian tidak dikirim:', ...failed)
  if (share.files.length > candidates.length && !wanted) {
    lines.push('', `ℹ️ Hanya ${candidates.length} file pertama diproses. Pilih nomor lain: ${prefix}${command} ${linkPart} <nomor>`)
  }
  return m.reply(lines.join('\n'))
}

handler.help = ['terabox <link> [nomor]']
handler.tags = ['downloader']
handler.command = ['terabox', 'tb', 'teradl']
handler.limit = true

export default handler
