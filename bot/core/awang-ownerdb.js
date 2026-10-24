/* By AlzRiss - Usanagi Umi AI */

import { getDb } from './awang-sqlite.js'

function normalizeOwnerNumber(number) {
  return String(number ?? '').replace(/\D/g, '')
}

function normalizeOwnerName(name) {
  const value = String(name ?? '')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return value.slice(0, 64)
}

function ensureSchema() {
  const db = getDb()
  db.exec(`
    CREATE TABLE IF NOT EXISTS owners (
      number TEXT PRIMARY KEY,
      addedAt INTEGER NOT NULL,
      addedBy TEXT,
      name TEXT
    );
  `)
  const columns = db.prepare('PRAGMA table_info(owners)').all()
  if (!columns.some((column) => column.name === 'name')) {
    db.exec('ALTER TABLE owners ADD COLUMN name TEXT')
  }
  return db
}

export function getDynamicOwners() {
  const db = ensureSchema()
  return db.prepare('SELECT number, addedAt, addedBy, name FROM owners ORDER BY addedAt ASC, number ASC').all()
}

export function getDynamicOwnerNumbers() {
  return getDynamicOwners().map((row) => row.number)
}

export function isDynamicOwner(number) {
  const normalized = normalizeOwnerNumber(number)
  if (!normalized) return false
  const db = ensureSchema()
  return Boolean(db.prepare('SELECT 1 FROM owners WHERE number = ? LIMIT 1').get(normalized))
}

export function addDynamicOwner(number, name, addedBy = null) {
  const normalized = normalizeOwnerNumber(number)
  const normalizedName = normalizeOwnerName(name)
  if (!normalized || normalized.length < 7 || normalized.length > 15) return { added: false, number: null, name: null, reason: 'invalid' }
  if (!normalizedName) return { added: false, number: normalized, name: null, reason: 'name_required' }

  const db = ensureSchema()
  const existing = db.prepare('SELECT number, name FROM owners WHERE number = ? LIMIT 1').get(normalized)

  if (existing) {
    if (existing.name === normalizedName) {
      return { added: false, updated: false, number: normalized, name: normalizedName, reason: 'exists' }
    }
    db.prepare('UPDATE owners SET name = ?, addedBy = ? WHERE number = ?')
      .run(normalizedName, addedBy ? String(addedBy) : null, normalized)
    return { added: false, updated: true, number: normalized, name: normalizedName, reason: 'updated' }
  }

  db.prepare('INSERT INTO owners (number, addedAt, addedBy, name) VALUES (?, ?, ?, ?)')
    .run(normalized, Date.now(), addedBy ? String(addedBy) : null, normalizedName)

  return { added: true, updated: false, number: normalized, name: normalizedName, reason: 'added' }
}

export function removeDynamicOwner(number) {
  const normalized = normalizeOwnerNumber(number)
  if (!normalized) return { removed: false, number: null, name: null, reason: 'invalid' }

  const db = ensureSchema()
  const existing = db.prepare('SELECT number, name FROM owners WHERE number = ? LIMIT 1').get(normalized)
  if (!existing) return { removed: false, number: normalized, name: null, reason: 'not_found' }

  db.prepare('DELETE FROM owners WHERE number = ?').run(normalized)

  return {
    removed: true,
    number: normalized,
    name: existing.name || null,
    reason: 'removed',
  }
}

export default {
  getDynamicOwners,
  getDynamicOwnerNumbers,
  isDynamicOwner,
  addDynamicOwner,
  removeDynamicOwner,
}
