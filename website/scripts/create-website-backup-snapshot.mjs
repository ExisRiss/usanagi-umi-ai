import fs from 'node:fs/promises'
import path from 'node:path'
import * as tar from 'tar'

const root = process.cwd()
const snapshotDirectory = path.join(root, '.backup-snapshot')
const output = path.join(snapshotDirectory, 'website-source.tar.gz')
const excludedDirectories = new Set(['.git', '.vercel', '.backup-snapshot', 'node_modules', 'coverage', '.next'])
const excludedFiles = new Set(['.env', '.env.local', '.env.production', '.env.development'])

function excluded(relative) {
  const parts = relative.split('/').filter(Boolean)
  if (parts.some(part => excludedDirectories.has(part))) return true
  const name = parts.at(-1) || ''
  if (excludedFiles.has(name) || name.startsWith('.env.')) return true
  if (/\.(?:pem|key|p12|pfx)$/i.test(name)) return true
  return false
}

async function collect(directory = root, prefix = '') {
  const files = []
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) continue
    const relative = path.posix.join(prefix, entry.name)
    if (excluded(relative)) continue
    const absolute = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...await collect(absolute, relative))
    else if (entry.isFile()) files.push(relative)
  }
  return files
}

await fs.rm(snapshotDirectory, { recursive: true, force: true })
await fs.mkdir(snapshotDirectory, { recursive: true, mode: 0o700 })
const files = (await collect()).sort()
if (!files.length) throw new Error('Tidak ada source website untuk snapshot backup.')
await tar.create({ cwd: root, file: output, gzip: true, portable: true, noMtime: true }, files)
await fs.chmod(output, 0o600)
console.log(`[backup-snapshot] website-source.tar.gz dibuat dari ${files.length} file aman.`)
