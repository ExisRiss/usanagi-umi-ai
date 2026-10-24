/**
 * Owner: baca log error bot (data/errors/*.jsonl) + uji notifikasi.
 *
 *   /errors            → 8 error terakhir
 *   /errors 20         → 20 error terakhir
 *   /errors uji        → kirim error percobaan ke Telegram (verifikasi jalur)
 *   /errors hapus      → bersihkan log lebih dari 14 hari
 *
 * Semua error sistem otomatis masuk ke berkas ini + notifikasi Telegram
 * (lihat lib/error-hub.js); perintah ini hanya untuk membacanya ulang.
 */
import fs from 'node:fs'
import path from 'node:path'
import {
  readRecentErrors, errorSummaryText, recordError, errorLogDir, redactErrorText,
} from '../../lib/error-hub.js'

const ADMIN_ROLES = new Set(['owner', 'developer', 'creator'])

function digits(value) {
  return String(value || '').split('@')[0].split(':')[0].replace(/\D/g, '')
}

function isOwnerNow(m) {
  const sender = digits(m.sender || m.chat)
  const owners = Array.isArray(global.owner) ? global.owner : []
  if (owners.some((entry) => String(Array.isArray(entry) ? entry[0] : entry).replace(/\D/g, '') === sender)) return true
  return ADMIN_ROLES.has(String(globalThis.__role || '').toLowerCase())
}

const helpText = (prefix) => [
  '╭─〔 🧯 LOG ERROR 〕─╮',
  `│ ${prefix}errors`,
  `│ ${prefix}errors <jumlah>`,
  `│ ${prefix}errors uji`,
  `│ ${prefix}errors hapus`,
  '╰───────────────────╯',
  '',
  'Setiap error bot otomatis ditulis ke data/errors/YYYY-MM-DD.jsonl',
  'dan dikirim ke Telegram owner (sekali per 10 menit per error yang sama).',
].join('\n')

let handler = async (m, { usedPrefix, text }) => {
  const prefix = usedPrefix || '/'
  if (!isOwnerNow(m)) return m.reply('❌ Fitur ini khusus owner bot.')

  const raw = String(text || '').trim()
  const action = raw.toLowerCase()

  if (['help', 'bantuan'].includes(action)) return m.reply(helpText(prefix))

  if (action === 'uji') {
    const result = await recordError(new Error('Uji jalur notifikasi error dari /errors'), {
      source: 'manual-test',
      plugin: 'umi-errors',
      command: 'errors',
      scope: 'whatsapp',
      chat: String(m.chat || ''),
      force: true,
    })
    return m.reply([
      result.notified > 0
        ? `✅ Uji terkirim ke ${result.notified} chat Telegram.`
        : '⚠️ Tercatat, tetapi tidak ada chat Telegram tujuan (cek TELEGRAM_BOT_TOKEN & TELEGRAM_OWNER_IDS).',
      `│ Log : ${result.logged ? 'tertulis' : 'gagal'}`,
      `│ Folder : ${errorLogDir()}`,
    ].join('\n'))
  }

  if (['hapus', 'bersih', 'prune'].includes(action)) {
    const dir = errorLogDir()
    let removed = 0
    try {
      const cutoff = Date.now() - 14 * 86400000
      for (const file of fs.readdirSync(dir)) {
        if (!file.endsWith('.jsonl')) continue
        const stamp = Date.parse(file.replace('.jsonl', ''))
        if (Number.isFinite(stamp) && stamp < cutoff) {
          fs.rmSync(path.join(dir, file), { force: true })
          removed += 1
        }
      }
    } catch { }
    return m.reply(removed ? `🗑️ ${removed} berkas log lama dihapus (lebih dari 14 hari).` : '✅ Tidak ada log lama yang perlu dihapus.')
  }

  if (action && /^\d+$/.test(action)) {
    return m.reply(redactErrorText(errorSummaryText(Math.min(30, Number(action)))))
  }

  return m.reply(redactErrorText(errorSummaryText(8)))
}

handler.help = ['errors [jumlah|uji|hapus]']
handler.tags = ['owner']
handler.command = /^(errors|errorlog|lasterrors)$/i
handler.owner = true

export default handler
