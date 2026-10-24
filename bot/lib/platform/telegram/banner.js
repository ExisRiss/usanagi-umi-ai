/**
 * Banner video untuk menu Telegram.
 *
 * Berkas disimpan di server (`data/platform/banner/menu.mp4`, bisa ditimpa
 * lewat `PLATFORM_BANNER_FILE`). Unggahan ke Telegram memakai multipart, lalu
 * `file_id` hasilnya di-cache di `platform_meta` supaya menu berikutnya tidak
 * mengunggah 4 MB lagi — Telegram menyimpan berkasnya sendiri.
 */
import fs from 'node:fs'
import path from 'node:path'
import { platformDb } from '../db.js'

/**
 * Lokasi berkas banner. Mengikuti folder database bila diatur, karena proses
 * bot di panel berjalan dengan cwd yang berbeda dari repo.
 */
export function bannerPath(env = process.env) {
  if (env.PLATFORM_BANNER_FILE) return env.PLATFORM_BANNER_FILE
  const dbFile = String(env.PLATFORM_DB_PATH || '').trim()
  if (dbFile) return path.join(path.dirname(dbFile), '..', 'platform', 'banner', 'menu.mp4')
  return path.join(process.cwd(), 'data', 'platform', 'banner', 'menu.mp4')
}

/**
 * Pastikan berkas banner ada. Bila belum ada tetapi `PLATFORM_BANNER_URL`
 * diatur, unduh sekali (maks 45 MB) lalu simpan — jadi deploy tidak perlu
 * mengunggah 4 MB lewat API berkas panel.
 */
export async function ensureBannerFile(env = process.env) {
  const file = bannerPath(env)
  if (fs.existsSync(file) && fs.statSync(file).size > 0) return { file, downloaded: false }
  const url = String(env.PLATFORM_BANNER_URL || '').trim()
  if (!/^https:\/\//i.test(url)) return { file, downloaded: false }
  const response = await fetch(url, { signal: AbortSignal.timeout(60000) })
  if (!response.ok) throw new Error(`Banner membalas HTTP ${response.status}.`)
  const type = String(response.headers.get('content-type') || '')
  if (!/video|octet-stream/i.test(type)) throw new Error(`Banner bukan video (${type || 'tipe tidak dikenal'}).`)
  const buffer = Buffer.from(await response.arrayBuffer())
  if (!buffer.length || buffer.length > 45 * 1024 * 1024) throw new Error('Ukuran banner tidak masuk akal.')
  fs.mkdirSync(path.dirname(file), { recursive: true })
  const temp = `${file}.part`
  fs.writeFileSync(temp, buffer)
  fs.renameSync(temp, file)
  return { file, downloaded: true, bytes: buffer.length }
}

function metaGet(key) {
  return platformDb().prepare('SELECT value FROM platform_meta WHERE key = ?').get(String(key))?.value || null
}

function metaSet(key, value) {
  platformDb().prepare('INSERT OR REPLACE INTO platform_meta(key, value) VALUES(?,?)').run(String(key), String(value))
}

function cacheKey(botId) {
  return `telegram_banner_file_id:${botId || 'main'}`
}

export function bannerInfo(botId = 'main', env = process.env) {
  const file = bannerPath(env)
  const exists = fs.existsSync(file)
  return {
    path: file,
    exists,
    bytes: exists ? fs.statSync(file).size : 0,
    fileId: metaGet(cacheKey(botId)),
  }
}

export function clearBannerCache(botId = 'main') {
  platformDb().prepare('DELETE FROM platform_meta WHERE key = ?').run(cacheKey(botId))
}

/**
 * Kirim banner. Mengembalikan `{ sent:false, reason }` bila berkas tidak ada,
 * sehingga pemanggil bisa jatuh ke pesan teks biasa (tidak pernah gagal diam).
 */
export async function sendBanner(ctx, { caption = '', replyMarkup = null } = {}) {
  const client = ctx.client
  if (!client || !ctx.chatId) return { sent: false, reason: 'tanpa-klien' }

  const cached = metaGet(cacheKey(ctx.botId))
  if (cached) {
    try {
      const message = await client.sendVideo(ctx.chatId, cached, {
        caption,
        reply_markup: replyMarkup || undefined,
        supports_streaming: true,
      })
      return { sent: true, cached: true, messageId: message?.message_id || null }
    } catch (error) {
      // file_id bisa kedaluwarsa kalau bot dipindah server; unggah ulang sekali.
      if (!/file|video|wrong/i.test(String(error.message))) throw error
      clearBannerCache(ctx.botId)
    }
  }

  let file = bannerPath(ctx.env || process.env)
  if (!fs.existsSync(file)) {
    // Unduhan sekali jalan; kegagalan tidak boleh menghalangi menu tampil.
    try {
      const ensured = await ensureBannerFile(ctx.env || process.env)
      file = ensured.file
      if (!fs.existsSync(file)) return { sent: false, reason: 'berkas-tidak-ada' }
    } catch (error) {
      return { sent: false, reason: 'unduh-gagal', error: String(error.message || error) }
    }
  }
  const buffer = fs.readFileSync(file)
  if (buffer.length > 45 * 1024 * 1024) return { sent: false, reason: 'terlalu-besar' }

  const message = await client.upload('video', ctx.chatId, buffer, {
    filename: 'menu.mp4',
    mime: 'video/mp4',
    caption,
    options: { reply_markup: replyMarkup || undefined, supports_streaming: true },
  })
  const fileId = message?.video?.file_id || message?.document?.file_id || null
  if (fileId) metaSet(cacheKey(ctx.botId), fileId)
  return { sent: true, cached: false, messageId: message?.message_id || null, fileId }
}
