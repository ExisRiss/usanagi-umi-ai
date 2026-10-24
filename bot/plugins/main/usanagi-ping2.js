/* By AlzRiss - Usanagi Umi AI */

import os from 'node:os'
import fs from 'node:fs'
import { execFileSync } from 'node:child_process'
import { performance } from 'node:perf_hooks'
import { settings } from '../../config/settings.js'
import { getDb } from '../../core/awang-sqlite.js'
import { sendNativeTableV1 } from '../../lib/awang-table.js'


const fmtSize = (value) => {
  const bytes = Number(value)
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const index = Math.min(
    units.length - 1,
    Math.floor(Math.log(bytes) / Math.log(1024))
  )

  const result = bytes / Math.pow(1024, index)
  if (!Number.isFinite(result) || result < 0) return '0 B'

  return `${result.toFixed(index === 0 ? 0 : 1)} ${units[index]}`
}

const fmtUp = (value) => {
  const seconds = Number(value)
  if (!Number.isFinite(seconds) || seconds < 0) return '0s'

  const total = Math.floor(seconds)
  const d = Math.floor(total / 86400)
  const h = Math.floor(total % 86400 / 3600)
  const m = Math.floor(total % 3600 / 60)
  const s = Math.floor(total % 60)

  if (d > 0) return `${d}d ${h}h ${m}m`
  if (h > 0) return `${h}h ${m}m ${s}s`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

const clean = (value, fallback = 'N/A') => {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim()
  return text || fallback
}

const safeInteger = (value, fallback = 0) => {
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? Math.floor(number) : fallback
}

const safePercent = (value) => {
  const number = Number(value)
  if (!Number.isFinite(number)) return '0.0%'
  return `${Math.max(0, Math.min(100, number)).toFixed(1)}%`
}

const getWaRoundtrip = (m) => {
  const rawTimestamp = m?.raw?.messageTimestamp ?? m?.messageTimestamp
  let timestamp = Number(rawTimestamp)

  if (!Number.isFinite(timestamp) || timestamp <= 0) return 1
  if (timestamp < 1_000_000_000_000) timestamp *= 1000

  const elapsed = Date.now() - timestamp
  return Number.isFinite(elapsed) && elapsed >= 1 ? Math.floor(elapsed) : 1
}

const getCpu = () => {
  try {
    const cpus = os.cpus()
    return Array.isArray(cpus) ? cpus : []
  } catch {
    return []
  }
}

const getMemory = () => {
  try {
    const total = safeInteger(os.totalmem())
    const free = safeInteger(os.freemem())
    const used = total > 0 ? Math.max(0, Math.min(total, total - free)) : 0
    return { total, free, used }
  } catch {
    return { total: 0, free: 0, used: 0 }
  }
}

const getHeap = () => {
  try {
    const memory = process.memoryUsage()
    return {
      used: safeInteger(memory.heapUsed),
      total: safeInteger(memory.heapTotal),
    }
  } catch {
    return { used: 0, total: 0 }
  }
}

const getCpuLoad = (cores) => {
  try {
    const load = os.loadavg?.()
    const first = Array.isArray(load) ? Number(load[0]) : 0
    const divisor = Math.max(1, safeInteger(cores, 1))
    return safePercent(first > 0 ? first / divisor * 100 : 0)
  } catch {
    return '0.0%'
  }
}

const getDisk = () => {
  try {
    if (typeof fs.statfsSync === 'function') {
      const stats = fs.statfsSync(process.platform === 'win32' ? 'C:\\' : '/')
      const blockSize = Number(stats.bsize)
      const totalBlocks = Number(stats.blocks)
      const freeBlocks = Number(stats.bfree)

      if (
        Number.isFinite(blockSize) && blockSize > 0 &&
        Number.isFinite(totalBlocks) && totalBlocks > 0 &&
        Number.isFinite(freeBlocks) && freeBlocks >= 0
      ) {
        const total = blockSize * totalBlocks
        const free = Math.min(total, blockSize * freeBlocks)
        return {
          total: Number.isFinite(total) && total > 0 ? total : 0,
          used: Number.isFinite(total - free) && total - free > 0 ? total - free : 0,
        }
      }
    }
  } catch {}

  try {
    if (process.platform === 'win32') {
      const result = execFileSync(
        'powershell.exe',
        [
          '-NoProfile',
          '-NonInteractive',
          '-Command',
          "Get-CimInstance Win32_LogicalDisk -Filter \"DeviceID='C:'\" | Select-Object Size,FreeSpace | ConvertTo-Json -Compress",
        ],
        { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], windowsHide: true }
      ).trim()

      const parsed = JSON.parse(result)
      const total = safeInteger(parsed?.Size)
      const free = safeInteger(parsed?.FreeSpace)

      if (total > 0) {
        return {
          total,
          used: Math.max(0, Math.min(total, total - free)),
        }
      }
    } else {
      const result = execFileSync(
        'df',
        ['-k', '--output=size,used', '/'],
        { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
      )
        .trim()
        .split(/\r?\n/)

      if (result.length > 1) {
        const values = result[1].trim().split(/\s+/).map(Number)
        const total = Number(values[0]) * 1024
        const used = Number(values[1]) * 1024

        if (Number.isFinite(total) && total > 0 && Number.isFinite(used) && used >= 0) {
          return {
            total,
            used: Math.min(total, used),
          }
        }
      }
    }
  } catch {}

  return { total: 0, used: 0 }
}

const getNetwork = () => {
  try {
    const interfaces = os.networkInterfaces() || {}
    let active = 'N/A'

    for (const [name, addresses] of Object.entries(interfaces)) {
      if (name.toLowerCase().includes('lo')) continue

      if (Array.isArray(addresses) && addresses.some((address) => (
        (address?.family === 'IPv4' || address?.family === 4) &&
        address?.internal === false
      ))) {
        active = name
        break
      }
    }

    return clean(active)
  } catch {
    return 'N/A'
  }
}

const getDatabaseStats = () => {
  try {
    const db = getDb()
    const users = safeInteger(
      db.prepare('SELECT COUNT(*) AS total FROM users').get()?.total
    )
    const premium = safeInteger(
      db.prepare('SELECT COUNT(*) AS total FROM users WHERE premium = 1').get()?.total
    )

    return { users, premium }
  } catch {
    return { users: 0, premium: 0 }
  }
}

const getGroupCount = async (conn) => {
  try {
    if (typeof conn?.groupFetchAllParticipating !== 'function') return 0

    const groups = await conn.groupFetchAllParticipating()
    return Object.keys(groups || {}).filter((jid) => jid.endsWith('@g.us')).length
  } catch {
    return 0
  }
}

const reactSafely = async (conn, m, text) => {
  try {
    if (typeof m?.react === 'function') {
      await m.react(text)
      return
    }
  } catch {}

  try {
    const key = m?.raw?.key || m?.key
    if (!key || typeof conn?.sendMessage !== 'function') return
    await conn.sendMessage(m.chat, { react: { text, key } })
  } catch {}
}

const buildErrorReply = async (m) => {
  try {
    await m.reply('Terjadi kesalahan saat membaca statistik sistem. Silakan coba lagi.')
  } catch {}
}

const handler = async (m, { conn }) => {
  const execStart = performance.now()

  await reactSafely(conn, m, '🕕')

  try {
    const cpu = getCpu()
    const cores = cpu.length > 0 ? cpu.length : 1
    const memory = getMemory()
    const heap = getHeap()
    const disk = getDisk()
    const network = getNetwork()
    const database = getDatabaseStats()
    const groups = await getGroupCount(conn)
    const totalExec = Math.max(0, Math.round(performance.now() - execStart))

    let hostname = 'N/A'
    try {
      hostname = clean(os.hostname())
    } catch {}

    let platform = 'N/A'
    try {
      platform = clean(`${os.platform()} ${os.arch()}`)
    } catch {}

    let nodeVersion = 'N/A'
    try {
      nodeVersion = clean(process.version)
    } catch {}

    let cpuModel = 'N/A'
    try {
      cpuModel = clean(cpu[0]?.model, 'N/A').slice(0, 25) || 'N/A'
    } catch {}

    let botUptime = '0s'
    try {
      botUptime = fmtUp(process.uptime())
    } catch {}

    let serverUptime = '0s'
    try {
      serverUptime = fmtUp(os.uptime())
    } catch {}

    const botName = clean(settings.botName, 'Usanagi Umi AI')
    const tableData = [
      ['WA Roundtrip', `${getWaRoundtrip(m)} ms`],
      ['Kecepatan Respon bot mu', `${totalExec} ms`],
      ['Status', 'Online'],
      ['Hostname', hostname],
      ['Platform', platform],
      ['Node', nodeVersion],
      ['CPU', cpuModel],
      ['Cores', `${cores}`],
      ['CPU Load', getCpuLoad(cores)],
      ['RAM', `${fmtSize(memory.used)} / ${fmtSize(memory.total)}`],
      ['Heap', `${fmtSize(heap.used)} / ${fmtSize(heap.total)}`],
      ['Disk', `${fmtSize(disk.used)} / ${fmtSize(disk.total)}`],
      ['Network', network],
      ['Users', `${database.users}`],
      ['Premium', `${database.premium}`],
      ['Groups', `${groups}`],
      ['Uptime Bot', botUptime],
      ['Uptime Server', serverUptime],
    ]

    await sendNativeTableV1(
      conn,
      m.chat,
      '⚡ System Performance',
      ['Metric', 'Value'],
      tableData,
      m.raw,
      {
        headerText: `${botName} *STATUS*\n\n- 🎄 Dibawah ini adalah statistik bot kita`,
        footer: '🍃 Realtime Monitoring',
      },
    )

    await reactSafely(conn, m, '✅')
  } catch {
    await reactSafely(conn, m, '☢')
    await buildErrorReply(m)
  }
}

handler.command = /^(ping2|speed2|p2|latency2|sys2|status2)$/i
handler.help = ['ping2', 'speed2', 'p2', 'latency2', 'sys2', 'status2']
handler.tags = ['main']
handler.category = 'main'
handler.description = 'Cek performa dan status sistem bot secara real-time'
handler.ownerOnly = false
handler.premiumOnly = false
handler.groupOnly = false
handler.privateOnly = false
handler.limit = false
handler.cooldown = 5
handler.energi = 0
handler.isEnabled = true

export default handler