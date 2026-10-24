/* By AlzRiss - Usanagi Umi AI
 *
 * Kebijakan retensi:
 *   recent   144 snapshot terakhir (10 menit x 24 jam)
 *   daily    7 arsip harian
 *   weekly   4 arsip mingguan
 *   monthly  3 arsip bulanan
 *
 * Arsip harian/mingguan/bulanan adalah snapshot yang "dipromosikan" karena
 * menjadi yang terbaru pada bucket waktunya — bukan salinan terpisah. Dengan
 * begitu tidak pernah ada jendela waktu tanpa backup yang bisa dipulihkan.
 */
import fs from 'node:fs'
import path from 'node:path'
import { logEvent } from './log.js'
import { removeBackupRecord } from './store.js'
import { dirSize } from './archive.js'
import { deleteExternal } from './external.js'

function dayKey(date) {
  return date.toISOString().slice(0, 10)
}

function monthKey(date) {
  return date.toISOString().slice(0, 7)
}

function weekKey(date) {
  const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const day = target.getUTCDay() || 7
  target.setUTCDate(target.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((target - yearStart) / 86400000 + 1) / 7)
  return `${target.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

/**
 * Tentukan arsip yang disimpan dan yang kedaluwarsa.
 * @param {Array<object>} records
 * @param {{recent:number,daily:number,weekly:number,monthly:number}} retention
 * @param {Date} [now]
 */
export function planRetention(records, retention, now = new Date()) {
  const completed = records
    .filter(record => record.status === 'completed' || record.status === 'partial')
    .filter(record => record.startedAt)
    .sort((a, b) => String(a.startedAt).localeCompare(String(b.startedAt)))

  const tiers = new Map()
  const recentCount = Math.max(1, Number(retention.recent) || 144)
  for (const record of completed.slice(-recentCount)) tiers.set(record.id, 'recent')

  const descending = completed.slice().reverse()

  const promote = (count, keyFn, tier) => {
    if (count <= 0) return
    const seen = new Set()
    for (const record of descending) {
      if (tiers.has(record.id)) continue
      const key = keyFn(new Date(record.startedAt))
      if (seen.has(key)) continue
      if (seen.size >= count) break
      seen.add(key)
      tiers.set(record.id, tier)
    }
  }

  promote(Number(retention.daily) || 0, dayKey, 'daily')
  promote(Number(retention.weekly) || 0, weekKey, 'weekly')
  promote(Number(retention.monthly) || 0, monthKey, 'monthly')

  void now
  return {
    keep: [...tiers.entries()].map(([id, tier]) => ({ id, tier })),
    expired: completed.filter(record => !tiers.has(record.id)).map(record => record.id),
  }
}

function removeArchiveFile(cfg, record) {
  if (!record.path) return
  const file = path.resolve(cfg.root, record.path)
  if (!file.startsWith(path.resolve(cfg.root))) return
  try {
    if (fs.existsSync(file)) fs.unlinkSync(file)
  } catch (error) {
    logEvent(cfg, { level: 'warn', type: 'retention', message: `Gagal hapus arsip ${record.id}: ${error.message}`, backupId: record.id })
  }
}

/**
 * Terapkan retensi. Hanya menghapus arsip yang lebih lama dari penggantinya,
 * dan tidak pernah menyentuh backup yang masih berjalan.
 */
export async function applyRetention(cfg, records, retention = cfg.retention) {
  const plan = planRetention(records, retention)
  const deleted = []
  const byId = new Map(records.map(record => [record.id, record]))
  const tierById = new Map(plan.keep.map(item => [item.id, item.tier]))

  for (const id of plan.expired) {
    const record = byId.get(id)
    if (!record) continue
    if (record.status === 'running' || record.status === 'queued') continue
    removeArchiveFile(cfg, record)
    if (record.external && record.external.key) {
      try {
        const result = await deleteExternal(cfg, record.external)
        if (!result.deleted && result.reason) {
          logEvent(cfg, { level: 'warn', type: 'retention', message: `Salinan eksternal ${id} tidak dihapus: ${result.reason}`, backupId: id })
        }
      } catch (error) {
        logEvent(cfg, { level: 'warn', type: 'retention', message: `Gagal hapus salinan eksternal ${id}: ${error.message}`, backupId: id })
      }
    }
    await removeBackupRecord(cfg, id)
    deleted.push(id)
  }

  return { ...plan, deleted, tierById: Object.fromEntries(tierById) }
}

/** Ruang terpakai arsip + sisa disk. */
export function storageUsage(cfg) {
  const archiveDir = path.join(cfg.root, 'archives')
  const used = dirSize(archiveDir)
  let free = null
  let total = null
  try {
    const stat = fs.statfsSync(cfg.root)
    free = Number(stat.bavail) * Number(stat.bsize)
    total = Number(stat.blocks) * Number(stat.bsize)
  } catch {}
  return {
    archiveDir,
    usedBytes: used,
    limitBytes: cfg.storageLimitBytes,
    diskFreeBytes: free,
    diskTotalBytes: total,
    percentOfLimit: cfg.storageLimitBytes ? Math.round((used / cfg.storageLimitBytes) * 1000) / 10 : null,
    percentOfDisk: total && free !== null ? Math.round(((total - free) / total) * 1000) / 10 : null,
  }
}

/** Cek apakah masih cukup ruang untuk backup baru sebesar perkiraan tertentu. */
export function hasCapacity(cfg, estimatedBytes, usage = storageUsage(cfg)) {
  if (usage.diskFreeBytes !== null && usage.diskFreeBytes < Math.max(cfg.minFreeBytes, estimatedBytes * 2)) {
    return { ok: false, reason: `ruang disk tersisa ${Math.round(usage.diskFreeBytes / 1048576)} MB` }
  }
  if (usage.usedBytes + estimatedBytes > cfg.storageLimitBytes) {
    return { ok: false, reason: `batas penyimpanan backup ${Math.round(cfg.storageLimitBytes / 1048576)} MB tercapai` }
  }
  return { ok: true }
}
