/* By AlzRiss - Usanagi Umi AI */

import fs from 'fs'
import path from 'path'
import { execFile } from 'child_process'
import { promisify } from 'util'
import { fileURLToPath } from 'url'
import { settings } from '../../config/settings.js'
import { normalizeNumber } from '../../lib/awang-cekakses.js'

const execFileAsync = promisify(execFile)

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = path.resolve(__dirname, '../..')
const BACKUP_DIR = path.join(ROOT_DIR, 'data', 'backups')

function getOwnerJid() {
  const [primaryOwner] = settings.ownerNumbers || []
  const ownerNumber = normalizeNumber(primaryOwner)

  if (!ownerNumber) {
    throw new Error('Nomor owner belum dikonfigurasi di settings.ownerNumbers.')
  }

  return `${ownerNumber}@s.whatsapp.net`
}

function buildBackupName() {
  const now = new Date()
  const pad = n => String(n).padStart(2, '0')

  return (
    `usanagi-backup-` +
    `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-` +
    `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}` +
    `.zip`
  )
}

const handler = async (m, { conn }) => {
  let outputPath

  try {
    await conn.sendMessage(
      m.chat,
      { text: '⏳ *Membuat ZIP backup source code...*\n\nMohon tunggu.' },
      { quoted: m.raw }
    )

    await fs.promises.mkdir(BACKUP_DIR, { recursive: true })

    const fileName = buildBackupName()
    outputPath = path.join(BACKUP_DIR, fileName)

    await execFileAsync(
      'zip',
      [
        '-r',
        '-q',
        outputPath,
        '.',
        '-x',

        'node_modules/*',
        '*/node_modules/*',

        '.git/*',
        '*/.git/*',
          
        'bin/**',

        'sessions/*',
        'session/*',
        'auth/*',
        'data/sessions/*',

        '*.sqlite',
        '*.sqlite-*',
        '*.sqlite*',
        '*.db',
        '*.db-*',

        'data/backups/*',
        '*.log',
        'logs/*',

        'tmp/*',
        'temp/*',
        '*.tmp'
      ],
      { cwd: ROOT_DIR }
    )

    const stat = await fs.promises.stat(outputPath)
    if (!stat.size) throw new Error('File backup kosong.')

    const sizeMB = (stat.size / 1024 / 1024).toFixed(2)
    const ownerJid = getOwnerJid()

    await conn.sendMessage(
      ownerJid,
      {

        document: await fs.promises.readFile(outputPath),
        mimetype: 'application/zip',
        fileName,
        caption:
          `✅ *BACKUP ZIP BERHASIL*\n\n` +
          `📦 File: ${fileName}\n` +
          `💾 Ukuran: ${sizeMB} MB\n\n` +
          `🔒 node_modules, session/auth, SQLite, .git, log, dan backup lama tidak disertakan.`
      }
    )

    await conn.sendMessage(
      m.chat,
      { text: '✅ *Backup berhasil dibuat dan dikirim secara private ke owner.*' },
      { quoted: m.raw }
    )

  } catch (err) {
    console.error('[BACKUPSC ERROR]', err)

    await conn.sendMessage(
      m.chat,
      {
        text:
          `❌ *BACKUP GAGAL*\n\n` +
          `${err?.message || String(err)}`
      },
      { quoted: m.raw }
    )
  } finally {
    if (outputPath) {
      await fs.promises.rm(outputPath, { force: true }).catch(() => {})
    }
  }
}

handler.command = /^backupsc|backup$/i
handler.help = ['backupsc']
handler.tags = ['owner']
handler.description = 'Backup source code ZIP tanpa dependency dan database'
handler.ownerOnly = true

export default handler
