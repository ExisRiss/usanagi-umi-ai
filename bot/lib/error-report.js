/**
 * Pelaporan error plugin otomatis ke halaman Feedback di website.
 *
 * Kenapa ini ada
 * --------------
 * Sebelumnya, kalau sebuah plugin melempar error, satu-satunya jejaknya adalah
 * `console.error` di dalam container dan sebuah pesan mentah ke pengguna. Log
 * container menimpa dirinya sendiri setelah beberapa ratus baris, jadi begitu
 * pengguna melaporkan "fitur X error", buktinya biasanya sudah hilang.
 *
 * Modul ini meneruskan laporan ke tabel audit website sehingga muncul di halaman
 * Feedback sebagai laporan otomatis — lengkap dengan plugin, perintah, pesan error,
 * dan jumlah kejadian. Pemilik sesi melihatnya di daftar laporannya sendiri.
 *
 * Aturan penting:
 *   1. Modul ini TIDAK BOLEH melempar. Ia dipanggil dari blok catch; kalau ia ikut
 *      gagal, error aslinya tertutup.
 *   2. Laporan dikumpulkan (throttle) per tanda tangan error. Satu plugin yang rusak
 *      dan dipakai seratus kali bukan berarti seratus laporan.
 */
import fs from 'node:fs'
import path from 'node:path'

/** Jeda minimum sebelum error yang sama dilaporkan lagi. */
const DEDUPE_WINDOW_MS = 10 * 60 * 1000
/** Batas laporan terkirim per jam, supaya website tidak dibanjiri. */
const MAX_PER_HOUR = 30
/** Batas waktu pengiriman laporan (jangan menahan balasan ke pengguna). */
const SEND_TIMEOUT_MS = 8000

const seen = new Map() // tanda tangan -> { first, last, count }
const sent = [] // timestamp laporan terkirim

const SESSION_DB = () => path.join(process.cwd(), 'data', 'jadibot-platform.json')

/**
 * URL website. Diambil dari UMI_SITE_URL, atau diturunkan dari URL cron backup yang
 * sudah ada di .backup-export.env, supaya tidak perlu variabel baru.
 */
function siteUrl() {
  const explicit = String(process.env.UMI_SITE_URL || '').trim()
  if (/^https?:\/\//i.test(explicit)) return explicit.replace(/\/+$/, '')
  const trigger = String(process.env.UMI_BACKUP_TRIGGER_URL || '').trim()
  if (/^https?:\/\//i.test(trigger)) {
    try {
      return new URL(trigger).origin
    } catch {}
  }
  return 'https://alzriss-comunity.vercel.app'
}

/**
 * Rahasia bersama untuk rute penerimaan laporan bot.
 * Memakai rahasia yang sudah ada di kedua sisi; UMI_ERROR_REPORT_SECRET menang bila
 * suatu saat diprovisikan terpisah.
 */
function reportSecret() {
  return String(
    process.env.UMI_ERROR_REPORT_SECRET || process.env.UMI_BACKUP_EXPORT_SECRET || process.env.BOT_BACKUP_EXPORT_SECRET || '',
  ).trim()
}

/** Ambil nomor sesi dari scope bot, mis. "jadibot:628123" -> "628123". */
function sessionFromScope(scope) {
  const match = String(scope || '').match(/jadibot:(\d{7,15})/)
  if (match) return match[1]
  return ''
}

/** Pemilik sesi menurut data/jadibot-platform.json. */
function sessionOwner(number) {
  if (!number) return { id: '', email: '' }
  try {
    const db = JSON.parse(fs.readFileSync(SESSION_DB(), 'utf8'))
    const row = db?.sessions?.[number]
    if (row) return { id: String(row.userId || ''), email: String(row.email || '') }
  } catch {}
  return { id: '', email: '' }
}

/** Bersihkan teks dari kredensial sebelum dikirim keluar. */
function redact(value) {
  return String(value ?? '').replace(
    /(?:gsk_|vcp_|ptl[ac]_|gh[pousr]_)[A-Za-z0-9_-]{12,}|sk-or-v1-[A-Za-z0-9_-]{12,}|github_pat_[A-Za-z0-9_]{12,}|eyJ[A-Za-z0-9_-]{40,}/g,
    '<redacted>',
  )
}

/**
 * Apakah error ini sebenarnya pesan untuk pengguna, bukan kerusakan plugin?
 *
 * Banyak plugin lama memakai `throw 'Teksnya mana?'` sebagai cara menampilkan
 * petunjuk. Dulu semua throw itu ikut dilaporkan sebagai error plugin sehingga
 * halaman Feedback penuh laporan palsu (mis. "Reply Pesan", "Format: .smeme ...",
 * "Ex: .t id hello"). Sekarang pesan seperti itu tidak dikirim ke website.
 */
export function isUserFacingError(error) {
  if (typeof error === 'string') return true
  if (!error || typeof error !== 'object') return false
  if (error.userFacing === true) return true
  const message = String(error.message || '').trim()
  if (!message) return false
  if (!error.stack) return true
  if (message.length > 220) return false
  return /^(?:Format|Contoh|Contoh penggunaan|Ex:|Gunakan|Balas|Reply|Teksnya|Masukin|Intro|Item\b|Quoted|Pilih|Ketik|Kirim|Balas media)/i.test(message)
}

/** Gangguan koneksi sesaat: dicatat di log, tapi bukan bug plugin. */
export function isTransientError(error) {
  const name = String(error?.name || '')
  const message = String(error?.message || error || '')
  if (name === 'AbortError') return true
  return /(?:Connection Closed|Connection Failure|connection lost|Timed Out|ECONNRESET|ECONNREFUSED|socket hang up|EAI_AGAIN)/i.test(message)
}

/** Tanda tangan untuk menggabungkan error yang sama. */
function signatureOf(plugin, command, error) {
  const message = redact(error?.message || error || '').slice(0, 160)
  return `${plugin || '?'}|${command || '?'}|${error?.name || 'Error'}|${message}`
}

/**
 * Catat kejadian. Mengembalikan { count, due } — `due` true bila laporan perlu dikirim
 * sekarang: saat pertama kali, atau setelah lewat jeda sejak laporan TERAKHIR terkirim.
 * (Membandingkan dengan waktu kejadian terakhir akan selalu menghasilkan 0 karena baru
 * saja diperbarui — itu tidak akan pernah mengirim laporan kedua.)
 */
function track(signature) {
  const now = Date.now()
  const entry = seen.get(signature)
  if (!entry) {
    seen.set(signature, { first: now, count: 1, sentAt: 0 })
    return { count: 1, due: true }
  }
  entry.count += 1
  if (now - entry.sentAt >= DEDUPE_WINDOW_MS) return { count: entry.count, due: true }
  return { count: entry.count, due: false }
}

/** True bila kuota per jam masih tersedia. */
function withinQuota() {
  const cutoff = Date.now() - 60 * 60 * 1000
  while (sent.length && sent[0] < cutoff) sent.shift()
  return sent.length < MAX_PER_HOUR
}

/** Buang tanda tangan lama supaya Map tidak tumbuh tanpa batas. */
function prune() {
  if (seen.size < 500) return
  const cutoff = Date.now() - 6 * 60 * 60 * 1000
  for (const [key, entry] of seen) {
    if (Math.max(entry.sentAt, entry.first) < cutoff) seen.delete(key)
  }
}

/**
 * Laporkan error sebuah plugin ke website.
 *
 * @param {object} input
 * @param {Error|unknown} input.error     error yang ditangkap
 * @param {string} input.plugin           nama plugin (relatif, mis. "rpg/rpg-bank.js")
 * @param {string} input.command          perintah yang dipakai
 * @param {string} [input.prefix]         prefiks perintah
 * @param {string[]} [input.args]         argumen perintah
 * @param {string} [input.sender]         pengirim
 * @param {string} [input.chat]           ruang chat
 * @param {string} [input.scope]          botConfig.scope (menentukan pemilik sesi)
 * @param {boolean} [input.isGroup]       apakah dari grup
 * @returns {Promise<{reported:boolean, reason?:string, count?:number}>} tidak pernah melempar
 */
export async function reportPluginError(input = {}) {
  try {
    const { error, plugin = '', command = '', prefix = '.', args = [], sender = '', chat = '', scope = '', isGroup = false } = input

    // Petunjuk pemakaian bukan bug: jangan penuhi halaman Feedback.
    if (isUserFacingError(error)) return { reported: false, reason: 'pesan untuk pengguna' }
    // Putus koneksi sesaat juga bukan bug plugin.
    if (isTransientError(error)) return { reported: false, reason: 'gangguan koneksi sesaat' }

    const signature = signatureOf(plugin, command, error)
    const { count, due } = track(signature)
    prune()
    if (!due) return { reported: false, reason: 'digabung ke laporan sebelumnya', count }
    if (!withinQuota()) return { reported: false, reason: 'kuota laporan per jam tercapai', count }

    const secret = reportSecret()
    if (!secret) return { reported: false, reason: 'rahasia laporan belum disetel', count }

    const session = sessionFromScope(scope)
    const owner = sessionOwner(session)

    const stack = redact(error?.stack || error?.message || error || '').slice(0, 3000)
    const firstLine = redact(error?.message || error || 'Error tanpa pesan').split('\n')[0].slice(0, 200)
    const title = `[Bot] ${plugin || 'plugin'} gagal pada .${command || '?'}`.slice(0, 160)
    const description = [
      `Error otomatis dari bot.`,
      ``,
      `Pesan: ${firstLine}`,
      `Jenis: ${error?.name || 'Error'}`,
      `Plugin: ${plugin || '-'}`,
      `Perintah: ${prefix}${command || '?'} ${args.join(' ')}`.trim(),
      `Konteks: ${isGroup ? 'grup' : 'pribadi'}`,
      session ? `Sesi bot: +${session}` : `Sesi bot: (bot utama)`,
      ``,
      `Jejak (stack):`,
      stack,
    ].join('\n')
    const steps = [
      `1. Kirim perintah: ${prefix}${command || '?'}${args.length ? ' ' + args.join(' ') : ''}`,
      `2. Error muncul saat plugin dijalankan`,
      `3. Terjadi ${count} kali sejak ${new Date(seen.get(signature)?.first || Date.now()).toLocaleString('id-ID')}`,
    ].join('\n')

    const payload = {
      title,
      description: description.slice(0, 5000),
      steps: steps.slice(0, 2500),
      plugin: plugin || null,
      command: `${prefix}${command || ''}`.trim() || null,
      severity: 'error',
      session_id: session || null,
      actor_id: owner.id || null,
      actor_email: owner.email || null,
      occurrences: count,
    }

    const response = await fetch(`${siteUrl()}/api/platform/feedback/bot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${secret}` },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
    })

    const body = await response.json().catch(() => ({}))
    if (!response.ok) {
      console.warn(`[ERROR-REPORT] Website menolak laporan (HTTP ${response.status}): ${body?.error || 'tanpa keterangan'}`)
      return { reported: false, reason: `HTTP ${response.status}`, count }
    }

    const entry = seen.get(signature)
    if (entry) entry.sentAt = Date.now()
    sent.push(Date.now())
    console.log(`[ERROR-REPORT] Laporan terkirim: ${plugin || 'plugin'} · ${count}× · ${payload.session_id ? '+' + payload.session_id : 'bot utama'}`)
    return { reported: true, count }
  } catch (failure) {
    // Jangan pernah melempar: pemanggilnya adalah blok catch.
    console.warn('[ERROR-REPORT] Gagal mengirim laporan:', failure?.message || failure)
    return { reported: false, reason: 'pengiriman gagal' }
  }
}

/** Untuk pengujian: bersihkan status penggabungan. */
export function resetErrorReportState() {
  seen.clear()
  sent.length = 0
}

export default reportPluginError
