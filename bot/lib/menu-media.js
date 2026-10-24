import fs from 'node:fs'
import path from 'node:path'

const defaultVideo = './assets/video/menu.mp4'

function exists(file) {
  try { return Boolean(file) && fs.statSync(file).isFile() } catch { return false }
}

function imageMime(file) {
  const extension = path.extname(file).toLowerCase()
  if (extension === '.png') return 'image/png'
  if (extension === '.webp') return 'image/webp'
  return 'image/jpeg'
}

function videoMime(file) {
  return path.extname(file).toLowerCase() === '.webm' ? 'video/webm' : 'video/mp4'
}

function legacyUploadedBanner(value) {
  return /(?:^|[\\/])sessions[\\/]jadibot[\\/]\d{7,15}[\\/]media[\\/]menu_banner\./i.test(String(value || ''))
}

/**
 * Resolve the menu visual for an individual bot session.
 *
 * Existing sessions keep their legacy video default. A new menu banner explicitly
 * chooses image mode; legacy banners uploaded before menuMediaType existed are
 * recognised from their safe per-session media path and also choose image mode.
 */
export function resolveMenuMedia(conn) {
  const assets = conn?.botConfig?.values?.brandingAssets || global.brandingAssets || {}
  const preference = String(assets.menuMediaType || '').toLowerCase()
  const preferImage = preference === 'image' || (preference !== 'video' && legacyUploadedBanner(assets.menu))
  const candidates = preferImage
    ? [{ type: 'image', file: assets.menu }, { type: 'video', file: assets.menuVideo || defaultVideo }]
    : [{ type: 'video', file: assets.menuVideo || defaultVideo }, { type: 'image', file: assets.menu }]

  for (const candidate of candidates) {
    if (!exists(candidate.file)) continue
    return {
      type: candidate.type,
      file: candidate.file,
      mimetype: candidate.type === 'image' ? imageMime(candidate.file) : videoMime(candidate.file),
    }
  }
  throw new Error('Aset menu tidak ditemukan.')
}

export function readMenuMedia(conn) {
  const media = resolveMenuMedia(conn)
  return { ...media, data: fs.readFileSync(media.file) }
}
