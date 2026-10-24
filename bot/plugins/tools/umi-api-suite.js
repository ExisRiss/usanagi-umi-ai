/* By AlzRiss - Usanagi Umi AI */

import axios from 'axios'
import FormData from 'form-data'

const BRAND = global.brandCredit || 'By AlzRiss - Usanagi Umi AI'
const CFG = global.rinAPI || {}
const BASE = String(CFG.baseUrl || 'https://apiii-xrina.vercel.app').replace(/\/+$/, '')
const TIMEOUT = Number(CFG.timeoutMs) || 180000
const MAX_BYTES = Number(CFG.maxResponseBytes) || 100 * 1024 * 1024

const ROUTES = {
  ai: ['aicostum', 'clara', 'claudehaiku', 'deepai', 'deepseek', 'ethan', 'gemini', 'gpt', 'guru', 'maya', 'notegpt', 'notrack-ai', 'nova', 'overchat', 'qwen', 'unlimitedai'],
  'ai-image': ['editimg', 'flux', 'hd', 'hd2', 'imagetoprompt', 'text2img', 'tobotak', 'tochibi', 'tofigura', 'tofigurav2', 'tofigurav3', 'tofunk', 'toghibli', 'tohijab', 'tohitam', 'tojapanese', 'tojepang', 'tokacamata', 'tokamboja', 'tolego', 'toliquor', 'tomaid', 'tomirror', 'tomoai', 'tomonyet', 'topacar', 'topeci', 'topiramida', 'toputih', 'toreal', 'toroblox', 'toroh', 'totato', 'totua', 'tounderground', 'toviking', 'tozombie'],
  canvas: ['codesnap', 'fakedev', 'fakeff', 'fakeff2', 'fakeffduo', 'fakeml', 'ffgirl', 'meme-polisi', 'nokia', 'quotes', 'windows'],
  download: ['aio', 'bilibili', 'capcut', 'facebook', 'gdrive', 'igmp3', 'instagram', 'mediafire', 'pindl', 'play', 'snackvideo', 'terabox', 'tiktok', 'twitterdl', 'ytmp3', 'ytmp4'],
  fun: ['cekcantik', 'cekganteng', 'cekiq', 'cekkhodam', 'ceksifat', 'longteks', 'pap', 'quotes-bijak', 'quotes-bucin', 'quotes-galau', 'quotes-gombal', 'quotes-motivasi'],
  game: ['asahotak', 'caklontong', 'kataacak', 'susunkata', 'tebakbendera', 'tebakbuah', 'tebakepep', 'tebakgambar', 'tebakhewan', 'tebakkalimat', 'tebakkata', 'tebakkimia', 'tebaktebakan'],
  info: ['antara', 'beritajakarta', 'bmkg-gempa', 'cnbc', 'cnn', 'infopublik', 'kemenag', 'kemkes', 'kompas', 'sindonews'],
  maker: ['attp', 'brat', 'brat-vermeil', 'bratgojo', 'bratspongebob', 'bratvid', 'bratvid2', 'qc', 'smeme', 'smemevid'],
  search: ['lyrics', 'npm', 'pinterest', 'resep', 'spotify', 'sticker-telegram', 'stickerly', 'ttsearch', 'ytsearch'],
  stalker: ['stalk-ff', 'stalk-ig', 'stalk-ml', 'stalk-roblox', 'stalk-threads', 'stalk-tiktok', 'stalk-x', 'stalk-yt'],
  tools: ['bypass', 'cekban-wa', 'cekmail', 'cekphising', 'hdvid', 'img2vid', 'ocr', 'qrcode', 'rateweb', 'readqr', 'recordweb', 'removebg', 'shortlink', 'speed-web', 'ssweb', 'tempmail', 'transkripsi', 'tts', 'txt2video', 'webtozip', 'whatmusic']
}

// Endpoint berisiko, penipuan, spam, penghapusan watermark, dan token akun
// sengaja tidak diekspos oleh suite ini.
const COMMAND_TO_CATEGORY = {
  // `umiai` tetap dimiliki AI utama Usanagi agar command tidak bentrok.
  umiimg: 'ai-image', umicanvas: 'canvas', umidl: 'download',
  umifun: 'fun', umigame: 'game', umiinfo: 'info', umimaker: 'maker',
  umisearch: 'search', umistalk: 'stalker', umitools: 'tools'
}

const IMAGE_INPUT_FREE = new Set(['flux', 'text2img'])
const NO_INPUT = new Set([
  'cekcantik', 'cekganteng', 'cekiq', 'longteks', 'quotes-bijak', 'quotes-bucin',
  'quotes-galau', 'quotes-gombal', 'quotes-motivasi', 'asahotak', 'caklontong',
  'kataacak', 'susunkata', 'tebakbendera', 'tebakbuah', 'tebakepep', 'tebakgambar',
  'tebakhewan', 'tebakkalimat', 'tebakkata', 'tebakkimia', 'tebaktebakan',
  'antara', 'cnbc', 'cnn', 'kompas', 'sindonews', 'tempmail'
])

function hasRoute(category, name) {
  return Boolean(ROUTES[category]?.includes(name))
}

function parseKeyValues(text) {
  const params = {}
  const regex = /([a-zA-Z0-9_-]+)=("[^"]*"|'[^']*'|\S+)/g
  let match
  while ((match = regex.exec(text))) {
    let value = match[2]
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1)
    params[match[1]] = value
  }
  return params
}

function isUrl(text) {
  try { return ['http:', 'https:'].includes(new URL(text).protocol) } catch { return false }
}

function defaultParams(category, name, text) {
  const input = String(text || '').trim()
  if (!input || NO_INPUT.has(name)) return {}
  if (category === 'ai') return { text: input }
  if (category === 'download') return name === 'play' ? { query: input } : { url: input }
  if (category === 'search') return { query: input }
  if (category === 'fun') return { name: input }
  if (category === 'info') return { page: input }
  if (category === 'maker') return { text: input }
  if (category === 'stalker') {
    if (name === 'stalk-ml') {
      const [id, server] = input.split(/[|,\s]+/)
      return { id, server }
    }
    if (name === 'stalk-ff') return { uid: input }
    return { username: input.replace(/^@/, '') }
  }
  if (category === 'canvas') return { text: input }
  if (category === 'tools') {
    if (['qrcode', 'tts'].includes(name)) return { text: input }
    if (name === 'txt2video') return { prompt: input }
    if (name === 'cekban-wa') return { number: input.replace(/\D/g, '') }
    if (name === 'cekmail') return { token: input }
    return { url: input }
  }
  return { text: input }
}

async function uploadImage(m) {
  const q = m.quoted || m
  const mime = String((q.msg || q)?.mimetype || q.mediaType || '')
  if (!/^image\//i.test(mime)) throw new Error('Reply foto untuk fitur ini.')
  const buffer = await q.download()
  if (!buffer?.length) throw new Error('Gagal mengunduh foto.')
  const form = new FormData()
  form.append('files[]', buffer, { filename: `rin-${Date.now()}.${mime.split('/')[1] || 'jpg'}` })
  const response = await axios.post('https://uguu.se/upload.php', form, {
    headers: form.getHeaders(), timeout: 60000, maxBodyLength: Infinity, maxContentLength: Infinity
  })
  const url = response?.data?.files?.[0]?.url
  if (!url) throw new Error('Gagal mengunggah foto sementara.')
  return url
}

function collectUrls(value, output = []) {
  if (!value || output.length >= 30) return output
  if (typeof value === 'string') {
    for (const found of value.match(/https?:\/\/[^\s"'<>]+/gi) || []) {
      const clean = found.replace(/[),.!?]+$/, '')
      if (!output.includes(clean)) output.push(clean)
    }
  } else if (Array.isArray(value)) value.forEach(item => collectUrls(item, output))
  else if (typeof value === 'object') Object.values(value).forEach(item => collectUrls(item, output))
  return output
}

function findText(value) {
  if (typeof value === 'string' && value.trim() && !isUrl(value.trim())) return value.trim()
  if (!value || typeof value !== 'object') return ''
  for (const key of ['result', 'response', 'answer', 'message', 'text', 'caption', 'description', 'title', 'lyrics']) {
    if (typeof value[key] === 'string' && value[key].trim() && !isUrl(value[key].trim())) return value[key].trim()
  }
  for (const item of Object.values(value)) {
    const found = findText(item)
    if (found) return found
  }
  return ''
}

function mediaType(url) {
  const clean = url.split('?')[0].toLowerCase()
  if (/\.(jpe?g|png|webp|gif)$/.test(clean)) return 'image'
  if (/\.(mp4|mov|webm|mkv)$/.test(clean)) return 'video'
  if (/\.(mp3|m4a|aac|ogg|opus|wav)$/.test(clean)) return 'audio'
  if (/\.(zip|rar|7z|pdf|apk|docx?|xlsx?)$/.test(clean)) return 'document'
  return 'unknown'
}

async function callRin(category, name, params) {
  if (CFG.apikey && !params.apikey) params.apikey = CFG.apikey
  const endpoint = category === 'maker' && name === 'bratvid2'
    ? `${BASE}/maker/bratvid2`
    : `${BASE}/${category}/${name}active`
  const response = await axios.get(endpoint, {
    params, timeout: TIMEOUT, responseType: 'arraybuffer', validateStatus: () => true,
    maxContentLength: MAX_BYTES, maxBodyLength: MAX_BYTES,
    headers: { Accept: 'application/json,image/*,video/*,audio/*,*/*', 'User-Agent': 'Mozilla/5.0 (Linux; Android 13) Chrome/140 Mobile' }
  })
  const type = String(response.headers['content-type'] || '').toLowerCase()
  if (response.status < 200 || response.status >= 300) {
    const detail = Buffer.from(response.data || '').toString().replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300)
    throw new Error(`UMI API HTTP ${response.status}${detail ? `: ${detail}` : ''}`)
  }
  if (/^(image|video|audio)\//.test(type) || /application\/(pdf|zip|octet-stream)/.test(type)) return { binary: Buffer.from(response.data), type }
  const raw = Buffer.from(response.data || '').toString('utf8')
  let data
  try { data = JSON.parse(raw) } catch { data = raw }
  if (data?.status === false || data?.success === false || data?.error === true) throw new Error(String(data.message || data.reason || data.error || 'API UMI gagal.'))
  return { data, type }
}

async function sendResult(conn, m, result, title) {
  const caption = `*${title}*\n${BRAND}`
  if (result.binary) {
    const ext = (result.type.split('/')[1] || 'bin').replace('jpeg', 'jpg').replace(/[^a-z0-9]/g, '')
    return conn.sendFile(m.chat, result.binary, `umi-result.${ext}`, caption, m)
  }
  const urls = collectUrls(result.data)
  const media = urls.find(url => mediaType(url) !== 'unknown') || urls[0]
  const text = findText(result.data)
  if (media) {
    try {
      const kind = mediaType(media)
      const ext = kind === 'image' ? 'jpg' : kind === 'video' ? 'mp4' : kind === 'audio' ? 'mp3' : 'bin'
      await conn.sendFile(m.chat, media, `umi-result.${ext}`, `${text ? text.slice(0, 1000) + '\n\n' : ''}${BRAND}`, m)
      const extra = urls.filter(url => url !== media).slice(0, 8)
      if (extra.length) await m.reply(`*Tautan lainnya:*\n${extra.join('\n')}\n\n${BRAND}`)
      return
    } catch {}
  }
  const body = text || JSON.stringify(result.data, null, 2) || String(result.data)
  await m.reply(`${caption}\n\n${body.slice(0, 12000)}`)
}

function menu(category = '') {
  if (category && ROUTES[category]) {
    return [`*UMI API • ${category.toUpperCase()}*`, '', ...ROUTES[category].map(name => `• ${name}`), '', `Pakai: .umi ${category}/${ROUTES[category][0]} key=value`, BRAND].join('\n')
  }
  const direct = Object.entries(global.umiDirectCommands || {})
    .map(([command, item]) => `• .${command} ${item.usage}`)
  return [
    '*UMI API SUITE*', '',
    ...Object.entries(ROUTES).map(([name, items]) => `• .umimenu ${name} — ${items.length} fitur`),
    '',
    '*Command UMI langsung:*',
    ...direct,
    '',
    '*Cara cepat:*',
    '.umiai halo (AI utama)',
    '.umi ai/gpt text=halo',
    '.umidl tiktok <url>',
    '.umisearch lyrics <judul>',
    '.umiimg toghibli (reply foto)',
    '.umigame tebakgambar',
    '.umitools qrcode <teks>',
    '',
    '*Mode lengkap:*',
    '.umi <kategori>/<endpoint> key=value',
    '', BRAND
  ].join('\n')
}

const handler = async (m, { conn, command, text, usedPrefix }) => {
  const cmd = String(command || '').toLowerCase()
  const input = String(text || '').trim()
  if (cmd === 'umimenu' || cmd === 'umilist') return m.reply(menu(input.toLowerCase()))

  let category = COMMAND_TO_CATEGORY[cmd]
  let name = ''
  let rest = ''

  if (cmd === 'umi') {
    const [route, ...tail] = input.split(/\s+/)
    ;[category, name] = String(route || '').toLowerCase().split('/')
    rest = tail.join(' ')
  } else {
    const [selected, ...tail] = input.split(/\s+/)
    name = String(selected || '').toLowerCase()
    rest = tail.join(' ')
  }

  if (!hasRoute(category, name)) return m.reply(`Fitur tidak ditemukan.\n\n${menu(category)}`)

  try {
    let params = parseKeyValues(rest)
    if (!Object.keys(params).length) params = defaultParams(category, name, rest)

    if (category === 'ai-image' && !IMAGE_INPUT_FREE.has(name)) {
      if (!params.url) params.url = await uploadImage(m)
      if (name === 'editimg' && !params.prompt) params.prompt = rest || 'Tingkatkan foto ini secara natural'
    } else if (category === 'ai-image' && IMAGE_INPUT_FREE.has(name)) {
      if (!params.prompt) params.prompt = rest
    }

    if (!NO_INPUT.has(name) && !Object.values(params).some(Boolean)) {
      throw new Error(`Masukkan parameter. Gunakan ${(usedPrefix || '.') + 'umi'} ${category}/${name} key=value`)
    }

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.raw?.key || m.key } }).catch(() => {})
    const result = await callRin(category, name, params)
    await sendResult(conn, m, result, `${category}/${name}`)
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.raw?.key || m.key } }).catch(() => {})
    m.limit?.success?.()
  } catch (error) {
    m.limit?.fail?.()
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.raw?.key || m.key } }).catch(() => {})
    await m.reply(`*UMI API gagal*\n${error?.message || error}\n\nJika layanan sedang HTTP 502, coba lagi setelah server API kembali normal.\n\n${BRAND}`)
  }
}

handler.help = ['umimenu [kategori]', 'umi <kategori>/<endpoint> key=value', 'umiimg <efek> (reply foto)', 'umidl <jenis> <url>', 'umifun <jenis> [nama]', 'umigame <jenis>', 'umiinfo <jenis>', 'umimaker <jenis> <teks>', 'umisearch <jenis> <query>', 'umistalk <jenis> <id>', 'umitools <jenis> <input>']
handler.tags = ['tools', 'internet', 'downloader', 'ai', 'fun', 'game']
handler.command = /^(umi|umimenu|umilist|umiimg|umicanvas|umidl|umifun|umigame|umiinfo|umimaker|umisearch|umistalk|umitools)$/i
handler.limit = true

export default handler
