
import { getDb } from './awang-sqlite.js'
import { isOwner } from '../lib/awang-cekakses.js'
import { isGroupAdmin } from '../lib/awang-aksesgrub.js'
import { deleteStoredMedia, saveGroupEventMedia } from './awang-welcome-media.js'

const MAX_TEXT_LENGTH = 4096
const pendingMediaOperations = new Map()
const eventConfigGenerations = new Map()
const eventMutationQueues = new Map()
let mediaOperationSequence = 0

function asString(value) {
  return typeof value === 'string' ? value : ''
}

function cleanText(value) {
  return asString(value).replace(/\u0000/g, '').trim()
}

function hasCustomConfig(config) {
  return Boolean(cleanText(config?.text) || config?.media)
}

function normalizeConfig(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null

  const config = {}
  const text = cleanText(value.text)
  if (text && text.length <= MAX_TEXT_LENGTH) config.text = text

  if (value.media && typeof value.media === 'object' && !Array.isArray(value.media)) {
    const mediaPath = asString(value.media.path).trim()
    const mediaType = asString(value.media.type).trim().toLowerCase()
    if (mediaPath && (mediaType === 'image' || mediaType === 'video' || mediaType === 'gif')) {
      config.media = {
        type: mediaType,
        mimetype: asString(value.media.mimetype) || (mediaType === 'image' ? 'image/jpeg' : 'video/mp4'),
        gifPlayback: Boolean(value.media.gifPlayback || mediaType === 'gif'),
        path: mediaPath,
        size: Number(value.media.size || 0),
        checksum: asString(value.media.checksum),
        duration: Number(value.media.duration || 0),
        width: Number(value.media.width || 0),
        height: Number(value.media.height || 0),
      }
    }
  }

  if (!hasCustomConfig(config)) return null

  if (Number.isFinite(Number(value.updatedAt)) && Number(value.updatedAt) > 0) {
    config.updatedAt = Math.floor(Number(value.updatedAt))
  }

  return config
}

function parseStoredConfig(raw) {
  if (typeof raw !== 'string' || !raw.trim()) return null
  try {
    return normalizeConfig(JSON.parse(raw))
  } catch {
    return null
  }
}

function columnForAction(action) {
  return action === 'goodbye' ? 'goodbyeConfig' : 'welcomeConfig'
}

function normalizeGroupId(groupId) {
  const value = asString(groupId).trim()
  return value.endsWith('@g.us') ? value : ''
}

function eventConfigKey(groupId, action) {
  return `${normalizeGroupId(groupId)}:${action === 'goodbye' ? 'goodbye' : 'welcome'}`
}

function bumpEventConfigGeneration(groupId, action) {
  const key = eventConfigKey(groupId, action)
  const next = (eventConfigGenerations.get(key) || 0) + 1
  eventConfigGenerations.set(key, next)
  return next
}

function getEventConfigGeneration(groupId, action) {
  return eventConfigGenerations.get(eventConfigKey(groupId, action)) || 0
}

export function getCommandArgumentText(m, usedPrefix) {
  const prefix = asString(usedPrefix)
  const command = asString(m?.command).toLowerCase()
  if (!prefix || !command) return cleanText(m?.text)

  const current = m?.currentMessage || m?.raw?.message || {}
  const source =
    current?.conversation ||
    current?.extendedTextMessage?.text ||
    current?.imageMessage?.caption ||
    current?.videoMessage?.caption ||
    current?.documentMessage?.caption ||
    current?.documentWithCaptionMessage?.message?.documentMessage?.caption ||
    ''
  const text = asString(source)
  const pattern = new RegExp(`^${escapeRegExp(prefix)}${escapeRegExp(command)}(?:\\s+|$)`, 'i')
  const match = text.match(pattern)
  if (!match) return cleanText(m?.text)
  return cleanText(text.slice(match[0].length))
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export async function ensureGroupManager(m, conn) {
  if (!m?.isGroup || !m?.chat?.endsWith('@g.us')) {
    return { allowed: false, reason: 'group' }
  }

  const owner = await isOwner(m.sender, conn)
  if (owner) return { allowed: true, owner: true, admin: false }

  const admin = await isGroupAdmin(conn, m.chat, m.sender)
  if (admin) return { allowed: true, owner: false, admin: true }

  return { allowed: false, owner: false, admin: false, reason: 'permission' }
}

function enqueueEventMutation(groupId, action, operation) {
  const key = eventConfigKey(groupId, action)
  const previous = eventMutationQueues.get(key) || Promise.resolve()
  const current = previous.catch(() => {}).then(operation)
  eventMutationQueues.set(key, current)

  return current.finally(() => {
    if (eventMutationQueues.get(key) === current) eventMutationQueues.delete(key)
  })
}

function writeGroupEventConfig(chatId, action, patch = {}) {
  const column = columnForAction(action)
  const db = getDb()
  const transaction = db.transaction(() => {
    const row = db.prepare(`SELECT ${column} AS config FROM group_welcome WHERE chatId = ?`).get(chatId)
    const current = parseStoredConfig(row?.config) || {}
    const next = { ...current }

    if (Object.prototype.hasOwnProperty.call(patch, 'text')) {
      if (patch.text === null) {
        delete next.text
      } else {
        const text = cleanText(patch.text)
        if (!text) throw new Error('Text custom tidak boleh kosong.')
        if (text.length > MAX_TEXT_LENGTH) throw new Error(`Text terlalu panjang. Maksimal ${MAX_TEXT_LENGTH} karakter.`)
        next.text = text
      }
    }

    if (Object.prototype.hasOwnProperty.call(patch, 'media')) {
      if (!patch.media) delete next.media
      else next.media = patch.media
    }


    next.updatedAt = Date.now()
    const normalized = normalizeConfig(next)

    db.prepare(`
      INSERT INTO group_welcome (chatId, enabled, goodbyeEnabled, ${column})
      VALUES (?, COALESCE((SELECT enabled FROM group_welcome WHERE chatId = ?), 1), COALESCE((SELECT goodbyeEnabled FROM group_welcome WHERE chatId = ?), 1), ?)
      ON CONFLICT(chatId) DO UPDATE SET ${column} = excluded.${column}
    `).run(chatId, chatId, chatId, normalized ? JSON.stringify(normalized) : null)

    return normalized
  })

  return transaction()
}

export async function updateGroupEventConfig(groupId, action, patch = {}) {
  const chatId = normalizeGroupId(groupId)
  if (!chatId) throw new Error('Target group tidak valid.')
  if (action !== 'welcome' && action !== 'goodbye') throw new Error('Jenis konfigurasi tidak valid.')

  return enqueueEventMutation(chatId, action, async () => {
    const saved = writeGroupEventConfig(chatId, action, patch)
    const verified = getGroupEventConfig(chatId, action)
    if (saved && !verified) throw new Error('Konfigurasi tersimpan tetapi tidak dapat diverifikasi.')
    const generation = bumpEventConfigGeneration(chatId, action)
    return saved ? { ...saved, __generation: generation } : { __generation: generation }
  })
}

export function queueGroupEventMedia({ groupId, action, source, patch = {} }) {
  const chatId = normalizeGroupId(groupId)
  if (!chatId) return Promise.reject(new Error('Target group tidak valid.'))
  if (action !== 'welcome' && action !== 'goodbye') return Promise.reject(new Error('Jenis konfigurasi tidak valid.'))
  if (!source?.message) return Promise.reject(new Error('Media tidak ditemukan.'))

  const key = `${chatId}:${action}`
  const token = ++mediaOperationSequence
  pendingMediaOperations.set(key, token)

  return enqueueEventMutation(chatId, action, async () => {
    if (pendingMediaOperations.get(key) !== token) return { success: false, stale: true, media: null }

    let savedMedia = null
    let oldMedia = null
    try {
      const baseConfig = getGroupEventConfig(chatId, action) || {}
      const saved = await saveGroupEventMedia({
        groupId: chatId,
        action,
        source,
      })
      savedMedia = saved

      if (pendingMediaOperations.get(key) !== token) {
        await deleteStoredMedia(savedMedia)
        return { success: false, stale: true, media: null }
      }

      const current = getGroupEventConfig(chatId, action) || {}
      oldMedia = current.media || null
      const effectivePatch = { media: savedMedia }

      if (Object.prototype.hasOwnProperty.call(patch, 'text')) {
        const baseText = asString(baseConfig.text)
        const currentText = asString(current.text)
        if (currentText === baseText) effectivePatch.text = patch.text
      }


      const nextConfig = writeGroupEventConfig(chatId, action, effectivePatch)
      const verified = getGroupEventConfig(chatId, action)
      if (nextConfig && !verified) throw new Error('Konfigurasi media tersimpan tetapi tidak dapat diverifikasi.')
      const generation = bumpEventConfigGeneration(chatId, action)

      if (pendingMediaOperations.get(key) !== token) {
        const latest = getGroupEventConfig(chatId, action)
        if (latest?.media?.path === savedMedia.path) {
          writeGroupEventConfig(chatId, action, { media: oldMedia || null })
          bumpEventConfigGeneration(chatId, action)
        }
        await deleteStoredMedia(savedMedia)
        return { success: false, stale: true, media: null }
      }

      if (oldMedia && oldMedia.path !== savedMedia.path) await deleteStoredMedia(oldMedia)
      return {
        success: true,
        stale: false,
        media: savedMedia,
        config: nextConfig ? { ...nextConfig, __generation: generation } : { __generation: generation },
      }
    } catch (error) {
      if (savedMedia) await deleteStoredMedia(savedMedia)
      return { success: false, stale: false, media: null, error }
    } finally {
      if (pendingMediaOperations.get(key) === token) pendingMediaOperations.delete(key)
    }
  })
}

export async function resetGroupEventComponent(groupId, action, component = 'all') {
  const chatId = normalizeGroupId(groupId)
  if (!chatId) throw new Error('Target group tidak valid.')
  if (action !== 'welcome' && action !== 'goodbye') throw new Error('Jenis konfigurasi tidak valid.')

  const normalizedComponent = String(component || 'all').toLowerCase()
  if (!['all', 'text', 'media'].includes(normalizedComponent)) {
    throw new Error('Komponen reset tidak valid.')
  }

  if (normalizedComponent === 'all') return resetGroupEventConfig(chatId, action)

  if (normalizedComponent === 'media') pendingMediaOperations.delete(`${chatId}:${action}`)

  return enqueueEventMutation(chatId, action, async () => {
    const column = columnForAction(action)
    const db = getDb()
    const row = db.prepare(`SELECT ${column} AS config FROM group_welcome WHERE chatId = ?`).get(chatId)
    const current = parseStoredConfig(row?.config)
    if (!current) return { changed: false, component: normalizedComponent, media: null }

    const next = { ...current }
    let removedMedia = null

    if (normalizedComponent === 'text') delete next.text
    if (normalizedComponent === 'media') {
      removedMedia = next.media || null
      delete next.media
    }

    const normalized = normalizeConfig(next)
    db.prepare(`UPDATE group_welcome SET ${column} = ? WHERE chatId = ?`).run(normalized ? JSON.stringify({ ...normalized, updatedAt: Date.now() }) : null, chatId)
    bumpEventConfigGeneration(chatId, action)

    if (removedMedia) await deleteStoredMedia(removedMedia)
    return { changed: true, component: normalizedComponent, media: removedMedia }
  })
}

export async function resetGroupEventConfig(groupId, action) {
  const chatId = normalizeGroupId(groupId)
  if (!chatId) throw new Error('Target group tidak valid.')
  if (action !== 'welcome' && action !== 'goodbye') throw new Error('Jenis konfigurasi tidak valid.')

  pendingMediaOperations.delete(`${chatId}:${action}`)

  return enqueueEventMutation(chatId, action, async () => {
    const column = columnForAction(action)
    const db = getDb()
    const row = db.prepare(`SELECT ${column} AS config FROM group_welcome WHERE chatId = ?`).get(chatId)
    const current = parseStoredConfig(row?.config)
    if (!current) return { changed: false, media: null }

    db.prepare(`UPDATE group_welcome SET ${column} = NULL WHERE chatId = ?`).run(chatId)
    const verifiedRow = db.prepare(`SELECT ${column} AS config FROM group_welcome WHERE chatId = ?`).get(chatId)
    if (parseStoredConfig(verifiedRow?.config)) {
      throw new Error('Konfigurasi custom belum berhasil di-reset.')
    }

    bumpEventConfigGeneration(chatId, action)
    if (current.media) await deleteStoredMedia(current.media)
    return { changed: true, media: current.media }
  })
}

export function getGroupEventConfig(groupId, action = 'welcome') {
  const chatId = normalizeGroupId(groupId)
  if (!chatId) return null
  if (action !== 'welcome' && action !== 'goodbye') return null

  const column = columnForAction(action)
  const row = getDb().prepare(`SELECT ${column} AS config FROM group_welcome WHERE chatId = ?`).get(chatId)
  return parseStoredConfig(row?.config)
}

export function getGroupWelcomeConfig(groupId) {
  return getGroupEventConfig(groupId, 'welcome')
}

export function getGroupGoodbyeConfig(groupId) {
  return getGroupEventConfig(groupId, 'goodbye')
}

export function getConfigSummary(config) {
  const media = config?.media
  let mediaLabel = 'Default'
  if (media?.type === 'image') mediaLabel = 'Gambar custom'
  else if (media?.type === 'video') mediaLabel = 'Video custom'
  else if (media?.type === 'gif') mediaLabel = 'GIF custom'

  return {
    text: Boolean(config?.text),
    media: mediaLabel,
    mediaDuration: Number(media?.duration || 0),
  }
}

export function getConfigReport(config = {}) {
  const summary = getConfigSummary(config)
  const text = cleanText(config?.text)
  const textPreview = text.length > 96 ? `${text.slice(0, 93).trimEnd()}...` : text
  return {
    hasCustom: Boolean(text || config?.media),
    text: Boolean(text),
    textPreview,
    media: summary.media,
    mediaDuration: summary.mediaDuration,
  }
}

export default {
  getGroupEventConfig,
  getGroupWelcomeConfig,
  getGroupGoodbyeConfig,
  getCommandArgumentText,
  ensureGroupManager,
  updateGroupEventConfig,
  resetGroupEventConfig,
  resetGroupEventComponent,
  getConfigSummary,
  getConfigReport,
  queueGroupEventMedia,
}
