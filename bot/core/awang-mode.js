
import { getDb } from './awang-sqlite.js'

const MODE_NORMAL = 'normal'
const MODE_ONLY_GC = 'onlygc'
const MODE_ONLY_PC = 'onlypc'

function ensureSchema() {
  const db = getDb()
  db.exec(`
    CREATE TABLE IF NOT EXISTS bot_access_mode (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      mode TEXT NOT NULL CHECK (mode IN ('normal', 'onlygc', 'onlypc'))
    );
  `)
  db.prepare('INSERT OR IGNORE INTO bot_access_mode (id, mode) VALUES (1, ?)').run(MODE_NORMAL)
  return db
}

export function getAccessModeState() {
  const db = ensureSchema()
  const row = db.prepare('SELECT mode FROM bot_access_mode WHERE id = 1').get()
  const mode = row?.mode === MODE_ONLY_GC || row?.mode === MODE_ONLY_PC ? row.mode : MODE_NORMAL

  return {
    mode,
    onlygc: mode === MODE_ONLY_GC,
    onlypc: mode === MODE_ONLY_PC,
  }
}

export function setAccessMode(mode) {
  if (![MODE_NORMAL, MODE_ONLY_GC, MODE_ONLY_PC].includes(mode)) {
    throw new Error('Mode akses tidak valid')
  }

  const db = ensureSchema()
  const update = db.prepare('UPDATE bot_access_mode SET mode = ? WHERE id = 1')
  const transaction = db.transaction((nextMode) => {
    update.run(nextMode)
  })

  transaction(mode)
  return getAccessModeState()
}

export function isAccessAllowed(isGroup, state = getAccessModeState()) {
  if (state.mode === MODE_ONLY_GC) return Boolean(isGroup)
  if (state.mode === MODE_ONLY_PC) return !isGroup
  return true
}

export const ACCESS_MODES = Object.freeze({
  NORMAL: MODE_NORMAL,
  ONLY_GC: MODE_ONLY_GC,
  ONLY_PC: MODE_ONLY_PC,
})

export default {
  getAccessModeState,
  setAccessMode,
  isAccessAllowed,
  ACCESS_MODES,
}
