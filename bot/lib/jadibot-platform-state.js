// One in-process platform registry for API and expired-session cleanup.
// Never release ownership until session/auth backups have been removed by the cleaner.
import fs from 'node:fs'
import path from 'node:path'
const validNumber = value => /^\d{7,15}$/.test(String(value || ''))
export function createPlatformSessionState(root = process.cwd()) {
  const file = path.join(root, 'data', 'jadibot-platform.json')
  const backupDir = path.join(root, 'data', 'jadibot-backups')
  const removing = new Set()
  let database
  function load() {
    if (database) return database
    let data
    try { data = JSON.parse(fs.readFileSync(file, 'utf8')) }
    catch (error) { if (error.code !== 'ENOENT') throw error; data = { sessions: {}, backups: {} } }
    for (const key of ['sessions', 'backups']) {
      if (data[key] === undefined) data[key] = {}
      if (!data[key] || typeof data[key] !== 'object' || Array.isArray(data[key])) throw Error('Registry Jadibot tidak valid; tidak ditimpa.')
    }
    database = data
    return database
  }
  function write(data) {
    fs.mkdirSync(path.dirname(file), { recursive: true })
    const temp = `${file}.${process.pid}.tmp`
    fs.writeFileSync(temp, `${JSON.stringify(data, null, 2)}\n`, { mode: 0o600 })
    fs.renameSync(temp, file)
  }
  function save() { write(load()) }
  function assertAvailable(number) {
    if (removing.has(String(number))) throw Object.assign(new Error('Sesi sedang dibersihkan. Coba lagi sebentar.'), { status: 409 })
  }
  function beginRemoval(number) {
    if (!validNumber(number) || removing.has(String(number))) return false
    removing.add(String(number)); return true
  }
  function endRemoval(number) { removing.delete(String(number)) }
  function numbers() {
    const data = load()
    return [...new Set([...Object.keys(data.sessions), ...Object.values(data.backups).map(row => row.sessionId)])].filter(validNumber)
  }
  function remove(number) {
    number = String(number)
    if (!validNumber(number)) throw Error('Nomor sesi tidak valid.')
    const data = load(), sessions = { ...data.sessions }, backups = { ...data.backups }
    const targets = Object.entries(backups).filter(([, row]) => String(row.sessionId) === number)
    // Validate all paths before deleting anything. Do not follow arbitrary metadata paths.
    const files = targets.map(([id, row]) => {
      if (!/^[a-zA-Z0-9-]{8,100}$/.test(id) || (row.id && row.id !== id)) throw Error('ID backup tidak valid; ownership tetap dikunci.')
      return path.join(backupDir, `${id}.json`)
    })
    for (const target of files) fs.rmSync(target, { force: true })
    for (const [id] of targets) delete backups[id]
    delete sessions[number]
    // Commit disk first, then replace the shared cache. Failed write retains ownership.
    write({ ...data, sessions, backups })
    database = { ...data, sessions, backups }
    return { removedSession: Boolean(data.sessions[number]), removedBackups: targets.length }
  }
  return { load, save, numbers, remove, assertAvailable, beginRemoval, endRemoval }
}
export const platformSessions = createPlatformSessionState()
