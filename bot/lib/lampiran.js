/* By AlzRiss - Usanagi Umi AI
 *
 * Task136 — pengenalan lampiran pada pesan masuk.
 *
 * Catatan penting soal `lib/simple.js` bot ini:
 *   • `m.mimetype` TIDAK didefinisikan untuk pesan masuk (hanya dipakai saat
 *     mengirim). Ini penyebab fitur deploy subdomain tidak pernah menerima
 *     berkas: pemeriksaan "ada dokumen?" selalu false.
 *   • Yang tersedia: `m.mediaMessage` (null kalau bukan media), `m.mtype`
 *     (mis. "documentMessage"), dan `m.msg` (isi pesannya; untuk dokumen
 *     berisi fileName/mimetype/caption).
 *
 * Modul ini yang dipakai bersama oleh plugin subdomain (dan bisa dipakai
 * plugin lain yang menerima kiriman berkas).
 */

const TIPE_MEDIA = /documentMessage|imageMessage|videoMessage|audioMessage|stickerMessage/i

function isiPesan(m) {
  return m?.message || null
}

/** Dokumen bisa dibungkus di documentWithCaptionMessage / viewOnce. */
function dokumenTerbungkus(m) {
  const isi = isiPesan(m)
  if (!isi) return null
  if (isi.documentMessage) return isi.documentMessage
  const bungkus = isi.documentWithCaptionMessage?.message
  if (bungkus?.documentMessage) return bungkus.documentMessage
  if (isi.viewOnceMessage?.message?.documentMessage) return isi.viewOnceMessage.message.documentMessage
  if (isi.viewOnceMessageV2?.message?.documentMessage) return isi.viewOnceMessageV2.message.documentMessage
  return null
}

/** true kalau pesan ini membawa berkas/media. */
export function adaLampiran(m) {
  if (!m) return false
  if (m.mediaMessage) return true
  if (dokumenTerbungkus(m)) return true
  if (TIPE_MEDIA.test(String(m.mtype || ''))) return true
  if (m.quoted) return adaLampiran(m.quoted, true)
  return false
}

/** Objek yang benar-benar membawa berkas (pesan ini sendiri, atau kutipannya). */
export function sumberLampiran(m) {
  if (!m) return null
  if (m.mediaMessage || dokumenTerbungkus(m) || TIPE_MEDIA.test(String(m.mtype || ''))) return m
  if (m.quoted && adaLampiran(m.quoted)) return m.quoted
  return m
}

/** Nama berkas dari dokumen (kalau ada). */
export function namaBerkasLampiran(m) {
  const s = sumberLampiran(m)
  const kandidat = [
    s?.msg?.fileName,
    dokumenTerbungkus(s)?.fileName,
    s?.message?.documentMessage?.fileName,
    s?.message?.documentWithCaptionMessage?.message?.documentMessage?.fileName,
    s?.filename,
    s?.msg?.documentMessage?.fileName,
  ]
  for (const nilai of kandidat) {
    const teks = String(nilai || '').trim()
    if (teks) return teks
  }
  return ''
}

/** Mimetype dokumen (kalau ada). */
export function mimeLampiran(m) {
  const s = sumberLampiran(m)
  return String(
    s?.msg?.mimetype ||
    dokumenTerbungkus(s)?.mimetype ||
    s?.message?.documentMessage?.mimetype ||
    s?.mimetype ||
    ''
  ).trim()
}

/** Caption dokumen (kalau ada), dipakai kalau user menempel kode di caption. */
export function captionLampiran(m) {
  const s = sumberLampiran(m)
  return String(
    s?.msg?.caption ||
    dokumenTerbungkus(s)?.caption ||
    s?.message?.documentMessage?.caption ||
    s?.text ||
    ''
  ).trim()
}

/**
 * Apakah teks ini kelihatan seperti kode HTML?
 * Dianggap HTML kalau diawali tag, atau memuat <!doctype/<html di 300 huruf
 * pertama (user kadang menempel kode setelah kalimat pembuka).
 */
export function tampakHtml(teks) {
  const isi = String(teks || '').trim()
  if (!isi) return false
  if (/^(<!doctype html|<html|<head|<body|<!--|<style|<script|<[a-z][\w-]*[\s>])/i.test(isi)) return true
  const awal = isi.slice(0, 300)
  return /<!doctype html|<html[\s>]/i.test(awal)
}

/**
 * Unduh berkas dari pesan (atau dari pesan yang dikutip).
 * @returns {Promise<Buffer|null>}
 */
export async function unduhLampiran(conn, m) {
  const s = sumberLampiran(m)
  if (!s) return null
  let buffer = null
  try {
    if (typeof s.download === 'function') buffer = await s.download()
  } catch (error) { }
  if (!buffer && typeof conn?.downloadMediaMessage === 'function') {
    try { buffer = await conn.downloadMediaMessage(s) } catch (error) { }
  }
  if (!buffer && typeof conn?.downloadM === 'function' && s.mediaType) {
    try { buffer = await conn.downloadM(s.mediaMessage?.[s.mediaType], String(s.mediaType).replace(/message/i, '')) } catch (error) { }
  }
  if (!buffer && Buffer.isBuffer(s.data)) buffer = s.data
  return Buffer.isBuffer(buffer) && buffer.length ? buffer : null
}
