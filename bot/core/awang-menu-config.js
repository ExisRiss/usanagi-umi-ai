/* By AlzRiss - Usanagi Umi AI */

import { getDb } from './awang-sqlite.js'

const DEFAULT_MENU_STYLE = 'modern'
const ALLOWED_MENU_STYLES = new Set(['default', 'modern'])

export function getMenuStyle() {
  const db = getDb()
  const row = db.prepare('SELECT style FROM menu_settings WHERE id = 1').get()
  return ALLOWED_MENU_STYLES.has(row?.style) ? row.style : DEFAULT_MENU_STYLE
}

export function setMenuStyle(style) {
  const value = String(style || '').trim().toLowerCase()
  if (!ALLOWED_MENU_STYLES.has(value)) throw new Error('Style menu tidak valid')

  const db = getDb()
  db.prepare(
    `INSERT INTO menu_settings (id, style) VALUES (1, ?)
     ON CONFLICT(id) DO UPDATE SET style = excluded.style`
  ).run(value)

  return value
}

export default { getMenuStyle, setMenuStyle }
