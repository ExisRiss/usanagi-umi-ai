import { assertBodySize, enforceSameOrigin, rateLimit, securityHeaders } from './_security.js'
import { getBotApiConfig } from './_bot-config.js'

// Halaman Panel: proxy Client API Pterodactyl (panel2) untuk server yang
// dibeli user lewat Wallet. Kepemilikan diverifikasi dari order di bot
// (sumber kebenaran wallet), kunci client panel hanya ada di env server
// Vercel dan tidak pernah dikirim ke browser.

const PANEL_URL = () => String(process.env.PANEL2_URL || 'https://panel2.ikyhost.cloud').replace(/\/+$/, '')
const PANEL_KEY = () => String(process.env.PANEL2_PLTC || '').trim()

const clean = (value, max = 300) => String(value ?? '').trim().slice(0, max)
const IDENTIFIER = /^[A-Za-z0-9]{6,16}$/
const SAFE_PATH = /^\/[A-Za-z0-9._\-/ ]*$/

function httpError(status, message) {
  return Object.assign(new Error(message), { status })
}

async function botOrders(req) {
  const authorization = String(req.headers.authorization || '')
  if (!/^Bearer\s+\S{20,}$/i.test(authorization)) throw httpError(401, 'Autentikasi diperlukan.')
  const bot = await getBotApiConfig()
  const response = await fetch(`${bot.origin}/api/wallet/orders`, {
    headers: { Accept: 'application/json', Authorization: authorization },
    signal: AbortSignal.timeout(20_000),
  }).catch(() => null)
  if (!response) throw httpError(502, 'Bot tidak dapat dihubungi.')
  if (response.status === 401 || response.status === 403) throw httpError(401, 'Sesi tidak valid. Silakan masuk lagi.')
  if (!response.ok) throw httpError(502, 'Daftar order tidak dapat dimuat.')
  const data = await response.json().catch(() => ({}))
  const orders = Array.isArray(data.orders) ? data.orders : []
  return orders.filter(order => order?.kind === 'panel' && order?.status === 'active' && IDENTIFIER.test(String(order?.panel?.serverIdentifier || '')))
}

async function panelClient(req, pathname, { method = 'GET', body, raw = false } = {}) {
  const key = PANEL_KEY()
  if (!key) throw httpError(503, 'Akses panel belum dikonfigurasi di server website.')
  let response
  try {
    response = await fetch(`${PANEL_URL()}/api/client${pathname}`, {
      method,
      headers: {
        Accept: 'Application/vnd.pterodactyl.v1+json',
        Authorization: `Bearer ${key}`,
        ...(body !== undefined ? { 'Content-Type': raw ? 'text/plain' : 'application/json' } : {}),
      },
      body: body === undefined ? undefined : (raw ? String(body) : JSON.stringify(body)),
      redirect: 'error',
      signal: AbortSignal.timeout(25_000),
    })
  } catch {
    throw httpError(502, 'Panel tidak dapat dihubungi. Coba lagi sebentar.')
  }
  if (response.status === 204) return null
  const text = await response.text()
  let data = null
  try { data = JSON.parse(text) } catch { data = text }
  if (!response.ok) {
    const detail = clean(data?.errors?.[0]?.detail || data?.message || '', 220)
    if (response.status === 409) throw httpError(409, detail || 'Server masih dalam proses pemasangan. Tunggu sebentar lalu muat ulang.')
    throw httpError(502, `Panel menolak permintaan (HTTP ${response.status})${detail ? `: ${detail}` : ''}`)
  }
  return data
}

function ownedServer(orders, identifier) {
  const order = orders.find(item => item.panel.serverIdentifier === identifier)
  if (!order) throw httpError(404, 'Server tidak ditemukan di akun kamu.')
  return order
}

function safeEntryName(value) {
  const raw = clean(value, 200)
  if (!raw || raw === '.' || raw === '..' || /[\/\\\u0000]/.test(raw)) throw httpError(400, 'Nama file tidak valid.')
  return raw
}

function safeFilePath(value, { allowRoot = false } = {}) {
  const raw = clean(value || '/', 400)
  const normalized = '/' + raw.replace(/^\/+/, '').split('/').filter(part => part && part !== '.' && part !== '..').join('/')
  if (!SAFE_PATH.test(normalized)) throw httpError(400, 'Lokasi file tidak valid.')
  if (!allowRoot && normalized === '/') throw httpError(400, 'Lokasi file tidak valid.')
  return normalized
}

export default async function handler(req, res) {
  securityHeaders(res)
  const action = clean(req.query?.action, 40)
  try {
    rateLimit(req, 'panel', 240, 60 * 1000)
    if (req.method !== 'GET') {
      enforceSameOrigin(req)
      assertBodySize(req, 2 * 1024 * 1024)
    }
    const orders = await botOrders(req)
    const serverPath = suffix => `/servers/${clean(req.query?.server, 16)}${suffix}`

    if (action === 'servers') {
      const servers = await Promise.all(orders.map(async order => {
        const identifier = order.panel.serverIdentifier
        const base = {
          identifier,
          itemName: order.itemName,
          serverName: order.panel.serverName,
          username: order.panel.username,
          panelUrl: order.panel.url || PANEL_URL(),
          createdAt: order.createdAt,
          state: 'unknown',
          resources: null,
          limits: null,
        }
        try {
          const [details, resources] = await Promise.all([
            panelClient(req, `/servers/${identifier}`),
            panelClient(req, `/servers/${identifier}/resources`).catch(() => null),
          ])
          const attrs = details?.attributes || {}
          base.name = attrs.name || base.serverName
          base.limits = attrs.limits || null
          base.node = attrs.node || null
          base.state = resources?.attributes?.current_state || (attrs.status ? 'installing' : 'unknown')
          base.resources = resources?.attributes?.resources || null
        } catch { base.state = 'installing' }
        return base
      }))
      return res.status(200).json({ servers })
    }

    const identifier = clean(req.query?.server, 16)
    if (!IDENTIFIER.test(identifier)) throw httpError(400, 'ID server tidak valid.')
    ownedServer(orders, identifier)

    if (action === 'resources' && req.method === 'GET') {
      const data = await panelClient(req, serverPath('/resources'))
      return res.status(200).json({ state: data?.attributes?.current_state || 'unknown', resources: data?.attributes?.resources || null })
    }
    if (action === 'websocket' && req.method === 'GET') {
      const data = await panelClient(req, serverPath('/websocket'))
      return res.status(200).json({ socket: data?.data?.socket || '', token: data?.data?.token || '' })
    }
    if (action === 'power' && req.method === 'POST') {
      const signal = clean(req.body?.signal, 10)
      if (!['start', 'stop', 'restart', 'kill'].includes(signal)) throw httpError(400, 'Aksi power tidak valid.')
      await panelClient(req, serverPath('/power'), { method: 'POST', body: { signal } })
      return res.status(200).json({ ok: true, signal })
    }
    if (action === 'files_list' && req.method === 'GET') {
      const directory = safeFilePath(req.query?.directory || '/', { allowRoot: true })
      const data = await panelClient(req, serverPath('/files/list?directory=' + encodeURIComponent(directory)))
      const files = (Array.isArray(data?.data) ? data.data : []).map(item => ({
        name: clean(item?.attributes?.name, 200),
        size: Number(item?.attributes?.size) || 0,
        isFile: item?.attributes?.is_file === true,
        modifiedAt: item?.attributes?.modified_at || null,
        mimetype: clean(item?.attributes?.mimetype, 80),
      })).filter(item => item.name)
      return res.status(200).json({ directory, files })
    }
    if (action === 'files_contents' && req.method === 'GET') {
      const file = safeFilePath(req.query?.file)
      const data = await panelClient(req, serverPath('/files/contents?file=' + encodeURIComponent(file)))
      const content = typeof data === 'string' ? data : ''
      if (content.length > 512 * 1024) throw httpError(413, 'File terlalu besar untuk dibuka di editor (maks 512 KB).')
      return res.status(200).json({ file, content })
    }
    if (action === 'files_save' && req.method === 'POST') {
      const file = safeFilePath(req.body?.file)
      const content = String(req.body?.content ?? '')
      if (content.length > 1024 * 1024) throw httpError(413, 'Isi file terlalu besar (maks 1 MB).')
      await panelClient(req, serverPath('/files/write?file=' + encodeURIComponent(file)), { method: 'POST', body: content, raw: true })
      return res.status(200).json({ ok: true, file })
    }
    if (action === 'files_download' && req.method === 'GET') {
      const file = safeFilePath(req.query?.file)
      const data = await panelClient(req, serverPath('/files/download?file=' + encodeURIComponent(file)))
      return res.status(200).json({ url: data?.attributes?.url || '' })
    }
    if (action === 'files_upload_url' && req.method === 'GET') {
      const data = await panelClient(req, serverPath('/files/upload'))
      return res.status(200).json({ url: data?.attributes?.url || '' })
    }
    if (action === 'files_delete' && req.method === 'POST') {
      const root = safeFilePath(req.body?.root || '/', { allowRoot: true })
      const files = (Array.isArray(req.body?.files) ? req.body.files : []).map(safeEntryName).slice(0, 30)
      if (!files.length) throw httpError(400, 'Tidak ada file yang dipilih.')
      await panelClient(req, serverPath('/files/delete'), { method: 'POST', body: { root, files } })
      return res.status(200).json({ ok: true })
    }
    if (action === 'files_rename' && req.method === 'POST') {
      const root = safeFilePath(req.body?.root || '/', { allowRoot: true })
      const from = safeEntryName(req.body?.from); const to = safeEntryName(req.body?.to)
      await panelClient(req, serverPath('/files/rename'), { method: 'PUT', body: { root, files: [{ from, to }] } })
      return res.status(200).json({ ok: true })
    }
    if (action === 'files_create_folder' && req.method === 'POST') {
      const root = safeFilePath(req.body?.root || '/', { allowRoot: true })
      const name = safeEntryName(req.body?.name)
      await panelClient(req, serverPath('/files/create-folder'), { method: 'POST', body: { root, name } })
      return res.status(200).json({ ok: true })
    }
    if (action === 'files_decompress' && req.method === 'POST') {
      const root = safeFilePath(req.body?.root || '/', { allowRoot: true })
      const file = safeEntryName(req.body?.file)
      await panelClient(req, serverPath('/files/decompress'), { method: 'POST', body: { root, file } })
      return res.status(200).json({ ok: true })
    }
    if (action === 'files_compress' && req.method === 'POST') {
      const root = safeFilePath(req.body?.root || '/', { allowRoot: true })
      const files = (Array.isArray(req.body?.files) ? req.body.files : []).map(safeEntryName).slice(0, 30)
      if (!files.length) throw httpError(400, 'Tidak ada file yang dipilih.')
      const data = await panelClient(req, serverPath('/files/compress'), { method: 'POST', body: { root, files } })
      return res.status(200).json({ ok: true, file: data?.attributes?.name || null })
    }
    if (action === 'startup' && req.method === 'GET') {
      const [startup, details] = await Promise.all([
        panelClient(req, serverPath('/startup')),
        panelClient(req, serverPath('')).catch(() => null),
      ])
      const variables = (Array.isArray(startup?.data) ? startup.data : []).map(item => ({
        key: clean(item?.attributes?.env_variable, 60),
        name: clean(item?.attributes?.name, 120),
        description: clean(item?.attributes?.description, 300),
        value: String(item?.attributes?.server_value ?? item?.attributes?.default_value ?? '').slice(0, 1000),
        editable: item?.attributes?.is_editable !== false,
      })).filter(item => item.key)
      return res.status(200).json({
        startupCommand: clean(startup?.meta?.startup_command || details?.attributes?.container?.startup_command || '', 1000),
        dockerImage: clean(details?.attributes?.container?.image || '', 200),
        variables,
      })
    }
    if (action === 'startup_variable' && req.method === 'POST') {
      const key = clean(req.body?.key, 60)
      const value = String(req.body?.value ?? '').slice(0, 1000)
      if (!/^[A-Z0-9_]{1,60}$/.test(key)) throw httpError(400, 'Variable tidak valid.')
      const data = await panelClient(req, serverPath('/startup/variable'), { method: 'PUT', body: { key, value } })
      return res.status(200).json({ ok: true, key, value: String(data?.attributes?.server_value ?? value).slice(0, 1000) })
    }
    throw httpError(404, 'Aksi panel tidak ditemukan.')
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message || 'Terjadi kesalahan.' })
  }
}
