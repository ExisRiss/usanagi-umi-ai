
import os from 'os'
import { createCanvas } from '@napi-rs/canvas'
import { prepareWAMessageMedia } from '@rexxhayanasi/elaina-baileys'
import { settings } from '../../config/settings.js'
import { ButtonV2 } from '../../lib/awang-tombol.js'

const W = 720, H = 430

const clean = (v, f = '-') =>
  String(v ?? f).replace(/\s+/g, ' ').trim()

const bytes = n => {
  if (!Number.isFinite(n) || n <= 0) return '0 MB'
  const u = ['B', 'KB', 'MB', 'GB']
  let i = 0, x = n
  while (x >= 1024 && i < u.length - 1) x /= 1024, i++
  return `${x.toFixed(i >= 2 ? 1 : 0)} ${u[i]}`
}

const uptime = s => {
  const d = Math.floor(s / 86400)
  const h = Math.floor(s % 86400 / 3600)
  const m = Math.floor(s % 3600 / 60)
  const sec = Math.floor(s % 60)
  return [
    d && `${d}d`, h && `${h}h`, m && `${m}m`, sec && `${sec}s`
  ].filter(Boolean).join(' ') || '0s'
}

const getStats = latency => {
  const cpu = os.cpus() || []
  const mem = process.memoryUsage()
  const total = os.totalmem()
  const used = total - os.freemem()
  const load = os.loadavg?.() || [0, 0, 0]

  return {
    latency,
    bot: clean(settings.botName, 'Usanagi Umi AI'),
    version: clean(settings.botVersion, '1.2'),
    mode: clean(settings.botMode, 'Public'),
    footer: clean(settings.footerText, settings.ownerName || 'Usanagi Umi AI'),
    year: clean(settings.footerYear, new Date().getFullYear()),
    platform: `${os.platform()} ${os.arch()}`,
    node: process.version,
    cpu: clean(cpu[0]?.model, 'Unknown CPU'),
    cores: cpu.length,
    ram: `${bytes(used)} / ${bytes(total)}`,
    rss: bytes(mem.rss),
    heap: `${bytes(mem.heapUsed)} / ${bytes(mem.heapTotal)}`,
    load: load.map(v => Number(v).toFixed(2)).join(' / '),
    uptime: uptime(process.uptime()),
    pid: process.pid
  }
}

const rr = (c, x, y, w, h, r, fill, stroke) => {
  c.beginPath()
  c.roundRect(x, y, w, h, r)
  if (fill) c.fillStyle = fill, c.fill()
  if (stroke) c.strokeStyle = stroke, c.lineWidth = 1, c.stroke()
}

const tx = (c, v, x, y, s, color = '#f1f3f6', weight = 'normal', align = 'left') => {
  c.font = `${weight} ${s}px Arial`
  c.fillStyle = color
  c.textAlign = align
  c.textBaseline = 'middle'
  c.fillText(clean(v), x, y)
}

const fit = (c, v, width, size = 10, weight = 'bold') => {
  let x = clean(v)
  c.font = `${weight} ${size}px Arial`
  while (x.length > 3 && c.measureText(x).width > width) x = x.slice(0, -1)
  return x.length < String(v).length ? `${x}…` : x
}

const neo = (c, x, y, w, h, r = 18) => {
  c.save()
  c.shadowColor = 'rgba(0,0,0,.58)'
  c.shadowBlur = 18
  c.shadowOffsetX = 6
  c.shadowOffsetY = 6
  rr(c, x, y, w, h, r, '#181b21')
  c.restore()

  c.save()
  c.shadowColor = 'rgba(255,255,255,.055)'
  c.shadowBlur = 15
  c.shadowOffsetX = -5
  c.shadowOffsetY = -5
  rr(c, x, y, w, h, r, '#181b21')
  c.restore()

  rr(c, x, y, w, h, r, null, 'rgba(255,255,255,.055)')
}

const line = (c, x, y, w) => {
  c.strokeStyle = 'rgba(255,255,255,.065)'
  c.lineWidth = 1
  c.beginPath()
  c.moveTo(x, y)
  c.lineTo(x + w, y)
  c.stroke()
}

const card = (c, x, y, w, title, value, accent) => {
  neo(c, x, y, w, 58, 16)

  c.save()
  c.shadowColor = accent
  c.shadowBlur = 9
  c.fillStyle = accent
  c.beginPath()
  c.arc(x + 19, y + 29, 4, 0, Math.PI * 2)
  c.fill()
  c.restore()

  tx(c, title, x + 32, y + 20, 8, '#737b87', 'bold')
  tx(c, fit(c, value, w - 42, 13), x + 32, y + 39, 13, '#edf0f4', 'bold')
}

const row = (c, x, y, w, title, value) => {
  tx(c, title, x, y, 9, '#737b87')
  tx(c, fit(c, value, w, 10), x + w, y, 10, '#e4e8ed', 'bold', 'right')
}

const makeCanvas = s => {
  const canvas = createCanvas(W, H)
  const c = canvas.getContext('2d')

  const bg = c.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, '#101216')
  bg.addColorStop(.5, '#191c22')
  bg.addColorStop(1, '#101216')
  c.fillStyle = bg
  c.fillRect(0, 0, W, H)

  const glow = c.createRadialGradient(610, 30, 10, 610, 30, 230)
  glow.addColorStop(0, 'rgba(174,188,255,.12)')
  glow.addColorStop(1, 'rgba(174,188,255,0)')
  c.fillStyle = glow
  c.fillRect(430, 0, 290, 210)

  tx(c, s.bot.toUpperCase(), 30, 28, 9, '#aebcff', 'bold')
  tx(c, 'PING', 30, 55, 23, '#f3f5f8', 'bold')
  tx(c, 'SYSTEM PERFORMANCE', 30, 77, 8, '#747c87', 'bold')

  neo(c, 610, 25, 80, 34, 17)
  c.fillStyle = '#8fd3ad'
  c.beginPath()
  c.arc(629, 42, 4, 0, Math.PI * 2)
  c.fill()
  tx(c, 'ONLINE', 640, 42, 8, '#dff7e8', 'bold')

  card(c, 30, 100, 155, 'RESPONSE', `${s.latency} ms`, '#aebcff')
  card(c, 197, 100, 155, 'UPTIME', s.uptime, '#8fd3ad')
  card(c, 364, 100, 155, 'MEMORY', s.rss, '#d5b878')
  card(c, 531, 100, 159, 'CPU CORE', s.cores, '#9ed9e8')

  neo(c, 30, 174, 325, 204, 20)
  tx(c, 'SYSTEM', 50, 199, 8, '#aebcff', 'bold')
  tx(c, 'Runtime', 50, 218, 14, '#f0f2f5', 'bold')
  line(c, 50, 233, 285)
  row(c, 50, 253, 285, 'Platform', s.platform)
  row(c, 50, 275, 285, 'Node.js', s.node)
  row(c, 50, 297, 285, 'CPU Core', s.cores)
  row(c, 50, 319, 285, 'Process', s.pid)
  row(c, 50, 341, 285, 'Mode', s.mode)
  row(c, 50, 363, 285, 'Version', s.version)

  neo(c, 375, 174, 315, 204, 20)
  tx(c, 'RESOURCE', 395, 199, 8, '#9ed9e8', 'bold')
  tx(c, 'Usage', 395, 218, 14, '#f0f2f5', 'bold')
  line(c, 395, 233, 275)
  row(c, 395, 253, 275, 'RAM', s.ram)
  row(c, 395, 275, 275, 'RSS', s.rss)
  row(c, 395, 297, 275, 'Heap', s.heap)
  row(c, 395, 319, 275, 'Load', s.load)
  row(c, 395, 341, 275, 'CPU', s.cpu)

  const total = os.totalmem()
  const used = total - os.freemem()
  const rp = total ? Math.min(1, used / total) : 0
  const mem = process.memoryUsage()
  const hp = mem.heapTotal ? Math.min(1, mem.heapUsed / mem.heapTotal) : 0

  tx(c, 'RAM', 395, 360, 7, '#737b87', 'bold')
  rr(c, 425, 356, 105, 8, 4, '#0d0f13')
  rr(c, 428, 359, Math.max(3, 99 * rp), 2, 1, '#9ed9e8')

  tx(c, 'HEAP', 550, 360, 7, '#737b87', 'bold')
  rr(c, 585, 356, 85, 8, 4, '#0d0f13')
  rr(c, 588, 359, Math.max(3, 79 * hp), 2, 1, '#aebcff')

  tx(c, `${s.footer} • ${s.year}`, 30, 402, 8, '#666d78')
  tx(c, `${s.bot} • Runtime Statistics`, W - 30, 402, 8, '#666d78', 'normal', 'right')

  return canvas.toBuffer('image/png')
}

const buildPing = s => [
  `🏓 *PONG • ${s.bot.toUpperCase()}*`,
  '',
  '> ╭─〔 ★ RESPONSE 〕',
  `> │ Speed  : *${s.latency} ms*`,
  `> │ Status : *Online & Stable*`,
  `> │ Uptime : *${s.uptime}*`,
  '> ╰──────────',
  '',
  '> ╭─〔 ✧ SYSTEM 〕',
  `> │ Platform : *${s.platform}*`,
  `> │ Node.js  : *${s.node}*`,
  `> │ CPU Core : *${s.cores}*`,
  `> │ Process  : *${s.pid}*`,
  '> ╰──────────',
  '',
  '> ╭─〔 ☣︎ RESOURCE 〕',
  `> │ RAM  : *${s.ram}*`,
  `> │ RSS  : *${s.rss}*`,
  `> │ Heap : *${s.heap}*`,
  `> │ Load : *${s.load}*`,
  '> ╰──────────',
  '',
  '> ╭─〔 🜲 BOT 〕',
  `> │ Name    : *${s.bot}*`,
  `> │ Version : *${s.version}*`,
  `> │ Mode    : *${s.mode}*`,
  '> ╰──────────\n'
].join('\n')

const buildImageMessage = async (conn, image) => {
  const media = await prepareWAMessageMedia(
    { image },
    { upload: conn.waUploadToServer }
  )

  return media?.imageMessage || null
}

const handler = async (m, { conn, usedPrefix }) => {
  const start = process.hrtime.bigint()

  const stats = getStats(
    Math.max(
      0,
      Math.round(
        Number(process.hrtime.bigint() - start) / 1e6
      )
    )
  )

  const image = makeCanvas(stats)

  const imageMessage = await buildImageMessage(conn, image)

  const button = new ButtonV2(conn)
    .setBody(buildPing(stats))
    .setFooter(`${stats.footer} • ${stats.year}`)

  if (imageMessage) {
    button.setMedia({
      headerType: 4,
      imageMessage
    })
  }

  button.addButton('OWNER BOT', `${usedPrefix}owner`)

  await button.send(m.chat, { quoted: m.raw })
}

handler.command = /^ping$/i
handler.help = ['ping']
handler.tags = ['main']
handler.description = 'Mengecek kecepatan respon dan statistik runtime bot'

export default handler