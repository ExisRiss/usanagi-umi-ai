/**
 * Integrasi API Rin — https://apiii-xrina.my.id (284 endpoint).
 *
 * Satu plugin, banyak perintah. Tiap perintah mewakili satu kategori endpoint,
 * nama endpoint jadi argumen pertama:
 *
 *   .xai gemini jelaskan cara kerja internet
 *   .xai list                        daftar model AI
 *   .ximg flux kucing oren           gambar dari teks
 *   .ximg toghibli <url-gambar>      ubah foto jadi gaya Ghibli
 *   .xdl ytmp4 <url> 720             unduh video YouTube
 *   .xcari lyrics bohemian rhapsody
 *   .xstalk stalk-gh octocat
 *   .xfun cekkhodam Alz
 *   .xcv fakech nama=Alz pp=<url> pengikut=1k jam=20.30
 *   .xmk brat halo dunia
 *   .xgame tebakhewan
 *   .xberita kompas
 *   .xtool qrcode halo
 *   .xprem rch-vip ...               butuh kunci API
 *   .xapi                            daftar kategori
 *   .xapi download                   daftar endpoint 1 kategori
 *   .xapi ytmp4                      detail parameter 1 endpoint
 *   .xrina /ai/gemini?text=halo      panggilan mentah
 *
 * Kunci API (kalau punya, untuk endpoint `apikey`): `global.apiKeys.xrina`
 * di config.js, atau `UMI_XRINA_KEY` di .platform.env / .env.apikeys.
 */
import {
  callXrina,
  describeXrinaRoute,
  findMediaUrl,
  findXrinaRoute,
  formatXrinaData,
  withDefaultKeys,
  xrinaCatalog,
  xrinaCategories,
  xrinaErrorMessage,
  xrinaNeedsKey,
  xrinaOk,
  xrinaRoutesByCategory,
  rankMediaCandidates,
  fetchMedia,
  mediaKind,
} from '../../lib/xrina-api.js'
import { apiKey } from '../../config/api-keys.js'
import uploadFile from '../../lib/uploader.js'

/** Perintah → kategori katalog. */
const GROUP_BY_COMMAND = {
  xai: ['ai'],
  ximg: ['ai image'],
  xdl: ['download'],
  xcari: ['search'],
  xstalk: ['stalker'],
  xfun: ['fun'],
  xcv: ['canvas'],
  xmk: ['maker'],
  xgame: ['game'],
  xberita: ['info'],
  xtool: ['tools'],
  xprem: ['premium'],
  xsys: ['system'],
  xkomik: ['komik', 'komiku', 'MangaDex'],
  xanime: ['Animein', 'Donghive'],
}

const LABEL = {
  xai: 'AI', ximg: 'AI Image', xdl: 'Download', xcari: 'Search', xstalk: 'Stalker',
  xfun: 'Fun', xcv: 'Canvas', xmk: 'Maker', xgame: 'Game', xberita: 'Berita',
  xtool: 'Tools', xprem: 'Premium', xsys: 'System', xkomik: 'Komik', xanime: 'Anime',
}

function routesForCommand(command) {
  const categories = GROUP_BY_COMMAND[command] || []
  const all = xrinaCatalog().routes
  return all.filter(route => categories.some(c => c.toLowerCase() === route.category.toLowerCase()))
}

/** Pisahkan `k=v` dari teks bebas. */
function splitTokens(raw) {
  const pairs = {}
  const free = []
  for (const token of String(raw || '').trim().split(/\s+/).filter(Boolean)) {
    const eq = token.indexOf('=')
    if (eq > 0) pairs[token.slice(0, eq)] = token.slice(eq + 1)
    else free.push(token)
  }
  return { pairs, free }
}

/** Susun parameter dari argumen pengguna sesuai katalog endpoint. */
function buildParams(route, raw) {
  const params = route.params || []
  const { pairs, free } = splitTokens(raw)
  const out = {}

  for (const [key, value] of Object.entries(pairs)) {
    const match = params.find(p => p.name === key || (p.aliases || []).includes(key))
    out[match ? match.name : key] = value
  }

  const missing = params.filter(p => !(p.name in out))
  if (!free.length || !missing.length) return out

  const TEXT_PARAM = /^(q|query|text|prompt|search|keyword|kata|nama|name|username|user|url|link|judul|title)$/i
  const textLike = missing.filter(p => TEXT_PARAM.test(p.name) && !(p.options && p.options.length))
  const requiredMissing0 = missing.filter(p => p.required)

  // Semua parameter opsional dan hanya ada satu parameter teks → seluruh kalimat masuk ke situ.
  if (!requiredMissing0.length && textLike.length === 1) {
    out[textLike[0].name] = free.join(' ')
    return out
  }

  const requiredMissing = requiredMissing0
  if (requiredMissing.length === 1 && free.length >= 1) {
    // Satu parameter wajib → seluruh sisa teks masuk ke situ.
    out[requiredMissing[0].name] = free.join(' ')
    return out
  }

  const queue = [...requiredMissing, ...missing.filter(p => !p.required)]
  let index = 0
  for (const param of queue) {
    if (index >= free.length) break
    if (param.options && param.options.length && !param.options.includes(free[index])) {
      if (!param.required) continue
    }
    const restAreText = index === free.length - 1
    out[param.name] = restAreText ? free.slice(index).join(' ') : free[index]
    index = restAreText ? free.length : index + 1
  }
  if (index < free.length) {
    const target = params.find(p => p.required && !(p.name in out)) || params[params.length - 1]
    if (target) out[target.name] = free.slice(index).join(' ')
  }
  return out
}

function paramHint(route) {
  const params = route.params || []
  if (!params.length) return 'tanpa parameter'
  return params
    .map(p => (p.required ? `${p.name}*` : p.name))
    .join(' ')
}

function categoryIndex(command) {
  const routes = routesForCommand(command)
  if (!routes.length) return 'Kategori ini belum tersedia.'
  const categories = [...new Set(routes.map(r => r.category))]

  if (categories.length === 1) {
    const names = routes.map(r => r.name).sort()
    return (
      `*${LABEL[command] || command}* — ${routes.length} endpoint\n\n` +
      names.map(n => `• ${n}`).join('\n') +
      `\n\nPakai: \`.${command} <nama> <isi>\`\nContoh: \`.${command} ${names[0]}\``
    )
  }

  // Beberapa kategori dalam satu perintah: tampilkan prefiks kategori.
  const blocks = categories.map(category => {
    const names = routes.filter(r => r.category === category).map(r => r.name).sort()
    return `*${category}* (${names.length})\n` + names.map(n => `• ${n}`).join('\n')
  })
  const sample = routes[0]
  return (
    `*${LABEL[command] || command}* — ${routes.length} endpoint\n\n` +
    blocks.join('\n\n') +
    `\n\nPakai: \`.${command} <kategori> <nama> <isi>\`\n` +
    `Contoh: \`.${command} ${sample.category} ${sample.name}\`\n` +
    `Prefiks kategori opsional kalau namanya unik.`
  )
}

/** Cari endpoint dari token pertama, dengan dukungan prefiks kategori. */
function resolveRoute(routes, words) {
  const categories = [...new Set(routes.map(r => r.category))]
  const tokens = [...words]
  let category = null

  if (tokens.length && categories.length > 1) {
    const hit = categories.find(c => c.toLowerCase() === tokens[0].toLowerCase())
    if (hit) {
      category = hit
      tokens.shift()
    }
  }

  const pool = category ? routes.filter(r => r.category === category) : routes
  if (!tokens.length) return { category, route: null, rest: '' }

  const name = tokens[0].toLowerCase()
  let route = pool.find(r => r.name.toLowerCase() === name)
  if (!route) route = pool.find(r => r.name.toLowerCase().startsWith(name))

  if (!route && !category && pool.length === 1) {
    route = pool[0]
    return { category, route, rest: tokens.join(' ').trim() }
  }

  return { category, route, rest: tokens.slice(1).join(' ').trim() }
}

/**
 * Unduh berkas hasil endpoint download lalu kirim sebagai media.
 * Tautan dari server sering mati (redirect ke halaman iklan), jadi dicoba
 * beberapa kandidat dan diverifikasi dulu; gagal semua → null (dilaporkan jujur).
 */
async function sendDownload(m, conn, data, caption) {
  const candidates = rankMediaCandidates(data, 5)
  for (const url of candidates) {
    const file = await fetchMedia(url, { timeout: 90_000 })
    if (!file.ok) continue
    const { kind, name } = mediaKind(file.mime, url)
    const extra = file.size > 2 * 1024 * 1024 ? '' : `\n_${(file.size / 1024).toFixed(0)} KB_`
    try {
      return await conn.sendFile(m.chat, file.buffer, name, `${caption}${extra}`, m, false, { mimetype: file.mime })
    } catch (error) {
      m.reply(`❌ Berkas berhasil diunduh (${(file.size / 1024 / 1024).toFixed(1)} MB) tapi gagal dikirim: ${String(error?.message || error).slice(0, 120)}`)
      return true
    }
  }
  return null
}

async function sendResult(m, conn, result, route) {
  const caption = `*${route.description || route.path}*\n_${route.category} • ${route.path} — Rin API_`

  if (result.kind === 'image') {
    return conn.sendFile(m.chat, result.buffer, 'rin.jpg', caption, m)
  }
  if (result.kind === 'video') {
    return conn.sendFile(m.chat, result.buffer, 'rin.mp4', caption, m)
  }
  if (result.kind === 'audio') {
    return conn.sendFile(m.chat, result.buffer, 'rin.mp3', caption, m)
  }
  if (result.kind === 'text') {
    const text = String(result.text || '').trim().slice(0, 3500)
    return m.reply(text || 'Balasan kosong dari server.')
  }

  const data = result.data
  const media = findMediaUrl(data)
  const isDownload = String(route.category).toLowerCase() === 'download'

  if (isDownload) {
    const sent = await sendDownload(m, conn, data, caption)
    if (sent) return sent
  }

  const body = formatXrinaData(data && typeof data === 'object' && 'data' in data ? data.data : data)
  const extra = media && !isDownload ? `\n\n🔗 ${media}` : ''
  const warning = isDownload ? '\n\n⚠️ Berkasnya tidak bisa diunduh dari server (tautan CDN kedaluwarsa/ditolak). Coba endpoint lain.' : ''
  return m.reply(`${caption}\n\n${body || '(data kosong)'}${extra}${warning}`.slice(0, 3500))
}

let handler = async (m, { conn, text, command }) => {
  const cmd = String(command).toLowerCase()
  const raw = String(text || '').trim()

  // ---------------------------------------------------------------- .xapi
  if (cmd === 'xapi') {
    if (!raw) {
      const categories = xrinaCategories()
      const lines = [...categories.entries()]
        .sort((a, b) => b[1].length - a[1].length)
        .map(([name, routes]) => `• ${name.toLowerCase()} — ${routes.length} endpoint`)
      return m.reply(
        `*API RIN — ${xrinaCatalog().total} endpoint*\n\n${lines.join('\n')}\n\n` +
        `\`.xapi <kategori>\` daftar endpoint\n` +
        `\`.xapi <nama endpoint>\` detail parameter\n\n` +
        `Perintah: ${Object.keys(GROUP_BY_COMMAND).map(c => `.${c}`).join(' ')}\n` +
        `Mentah: \`.xrina /path?k=v\``,
      )
    }
    const byCategory = xrinaRoutesByCategory(raw)
    if (byCategory.length) {
      return m.reply(
        `*${raw.toUpperCase()}* — ${byCategory.length} endpoint\n\n` +
        byCategory.map(r => `• ${r.name}${r.premium ? ' (premium)' : ''}`).join('\n'),
      )
    }
    const route = findXrinaRoute(raw)
    if (!route) return m.reply(`Endpoint "${raw}" tidak ada di katalog. Coba \`.xapi\`.`)
    const params = (route.params || [])
      .map(p => `• ${p.name}${p.required ? ' *wajib*' : ''}${p.options ? ` — pilihan: ${p.options.join(', ')}` : ''}${p.aliases ? ` — alias: ${p.aliases.join(', ')}` : ''}`)
      .join('\n') || '• tanpa parameter'
    return m.reply(
      `*${route.name}*\n${route.description}\n\n\`${route.path}\`\n` +
      `Kategori: ${route.category}${route.premium ? ' • premium' : ''}${route.secretKey ? ' • butuh secret key' : ''}\n\n` +
      `*Parameter:*\n${params}`,
    )
  }

  // --------------------------------------------------------------- .xrina
  if (cmd === 'xrina') {
    if (!raw) return m.reply('Contoh: `.xrina /ai/gemini?text=halo`')
    const [pathPart] = raw.split(' ')
    if (!pathPart.startsWith('/')) return m.reply('Path harus diawali `/`, contoh `.xrina /game/tebakhewan`')
    const [pathOnly, queryPart] = pathPart.split('?')
    const params = {}
    for (const [k, v] of new URLSearchParams(queryPart || '')) params[k] = v
    const route = findXrinaRoute(pathOnly) || { path: pathOnly, category: 'raw', description: pathOnly, params: [] }
    const result = await callXrina(route, withDefaultKeys(route, params), { timeout: 120000 })
    if (!xrinaOk(result)) return m.reply(`❌ ${xrinaErrorMessage(result)}`)
    return sendResult(m, conn, result, route)
  }

  // ------------------------------------------------------- perintah kategori
  const routes = routesForCommand(cmd)
  if (!routes.length) return m.reply(`Perintah ${cmd} tidak dikenal.`)

  if (!raw || /^(list|daftar|help)$/i.test(raw)) return m.reply(categoryIndex(cmd))

  const words = raw.split(/\s+/).filter(Boolean)
  const resolved = resolveRoute(routes, words)
  let route = resolved.route

  if (!route && resolved.category) {
    const names = routes.filter(r => r.category === resolved.category).map(r => r.name).sort()
    return m.reply(
      `*${resolved.category}* — ${names.length} endpoint\n\n` +
      names.map(n => `• ${n}`).join('\n') +
      `\n\nPakai: \`.${cmd} ${resolved.category} <nama> <isi>\``,
    )
  }
  if (!route) {
    return m.reply(
      `Endpoint "${words[0]}" tidak ada di ${LABEL[cmd] || cmd}.\n\n${categoryIndex(cmd)}`,
    )
  }

  const rest = resolved.rest
  const params = withDefaultKeys(route, buildParams(route, rest))

  // Parameter gambar belum diisi tapi user membalas/mengirim foto → unggah fotonya,
  // supaya perintah seperti `.xcv ttqc` / `.ximg toghibli` bisa dipakai tanpa URL.
  const IMAGE_PARAM = /^(image|img|url|link|pp|avatar|photo|foto|cover|gambar|media)$/i
  const imageParam = (route.params || []).find(p => IMAGE_PARAM.test(p.name) && !params[p.name])
  if (imageParam) {
    const quoted = m.quoted ? m.quoted : m
    const quotedMime = String((quoted.msg || quoted).mimetype || quoted.mediaType || '')
    if (/^image\//i.test(quotedMime)) {
      try {
        await m.react('📤')
        const media = await quoted.download()
        if (media && media.length) {
          params[imageParam.name] = await uploadFile(media, 'rin.jpg')
        }
      } catch (error) {
        return m.reply(`❌ Gagal mengunggah gambar lampiran: ${String(error?.message || error).slice(0, 150)}`)
      }
    }
  }

  const missing = (route.params || []).filter(p => p.required && !(p.name in params))
  if (missing.length) {
    return m.reply(
      `*${route.description || route.name}*\n\n` +
      `\`${describeXrinaRoute(route)}\`\n\n` +
      `Isi parameter wajib: ${missing.map(p => `*${p.name}*`).join(', ')}\n` +
      `Contoh: \`.${cmd} ${[...new Set(routes.map(r => r.category))].length > 1 ? `${route.category} ` : ''}${route.name} ${missing.map(p => `<${p.name}>`).join(' ')}\``,
    )
  }

  if (xrinaNeedsKey(route) && !params.apikey && !apiKey('xrina')) {
    return m.reply(
      `🔑 Endpoint *${route.name}* butuh kunci API Rin.\n\n` +
      `Isi di config.js:\n\`global.apiKeys = { ..., xrina: 'KUNCI-KAMU' }\`\n` +
      `atau tulis langsung: \`apikey=KUNCI\` di akhir perintah.`,
    )
  }

  try {
    await m.react('⏳')
  } catch {}

  try {
    const result = await callXrina(route, params, { timeout: 120000 })
    if (!xrinaOk(result)) {
      const message = xrinaErrorMessage(result)
      const hint = /CONTOH di dokumentasi/i.test(message)
        ? '\n\nServer menolak karena isinya persis contoh dokumentasi. Coba dengan data lain.'
        : ''
      return m.reply(`❌ *${route.name}*\n\n${message}${hint}`)
    }
    try { await m.react('✅') } catch {}
    return await sendResult(m, conn, result, route)
  } catch (error) {
    const timeout = /timeout|ECONNABORTED/i.test(String(error?.message || ''))
    return m.reply(
      timeout
        ? `⏱️ *${route.name}* tidak merespons dalam 2 menit. Coba lagi nanti.`
        : `❌ *${route.name}* gagal: ${String(error?.message || error).slice(0, 200)}`,
    )
  }
}

handler.help = [
  'xai <model> <teks>',
  'ximg <alat> <teks/url> / balas foto',
  'xdl <sumber> <url>',
  'xcari <sumber> <query>',
  'xstalk <sumber> <user>',
  'xfun <jenis> [teks]',
  'xcv <jenis> [k=v] / balas foto',
  'xmk <jenis> <teks>',
  'xgame <jenis>',
  'xberita <sumber>',
  'xkomik <sumber> <aksi>',
  'xanime <sumber> <aksi>',
  'xtool <alat> <isi>',
  'xapi [kategori/endpoint]',
  'xrina <path>',
]
handler.tags = ['internet']
handler.command = /^(xai|ximg|xdl|xcari|xstalk|xfun|xcv|xmk|xgame|xberita|xkomik|xanime|xtool|xprem|xsys|xapi|xrina)$/i
handler.description = 'API Rin (apiii-xrina.my.id) — 284 endpoint'
handler.cooldown = 4

export default handler
