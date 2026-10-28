/* By AlzRiss - Usanagi Umi AI
 *
 * Task135 — kendali server Minecraft (BDS 1.26.x, NetherNet) dari WhatsApp.
 *
 * Bot mengendalikan server lewat Client API panel tempat MC berjalan:
 *   GET  /api/client/servers/{id}/resources            → CPU/RAM/disk/uptime/state
 *   GET  /api/client/servers/{id}/files/contents       → baca console.log
 *   POST /api/client/servers/{id}/command              → kirim perintah console
 *   POST /api/client/servers/{id}/power                → start/stop/restart
 *
 * Kredensial TIDAK disimpan di repo: dibaca dari data/mc-kaira.json (mode 600)
 * yang hanya berisi url panel, client API key, dan id server.
 */

import fs from 'fs'
import path from 'path'
import https from 'https'
import http from 'http'
import net from 'net'

const BERKAS_KONFIG = path.join(process.cwd(), 'data', 'mc-kaira.json')
const BERKAS_RIWAYAT = path.join(process.cwd(), 'data', 'mc-kaira-history.json')

let cacheKonfig = null

export function bacaKonfig(kuatUlang = false) {
  if (cacheKonfig && !kuatUlang) return cacheKonfig
  try {
    const isi = JSON.parse(fs.readFileSync(BERKAS_KONFIG, 'utf8'))
    cacheKonfig = {
      panelUrl: String(isi.panelUrl || '').replace(/\/+$/, ''),
      apiKey: String(isi.apiKey || ''),
      serverId: String(isi.serverId || ''),
      label: String(isi.label || 'Minecraft Server'),
      joinHost: String(isi.joinHost || ''),
      joinPort: Number(isi.joinPort || 0),
    }
  } catch (error) {
    cacheKonfig = null
  }
  return cacheKonfig
}

export function konfigSiap() {
  const cfg = bacaKonfig()
  return Boolean(cfg && cfg.panelUrl && cfg.apiKey && cfg.serverId)
}

function permintaan(method, jalur, isi = null, timeoutMs = 20000) {
  const cfg = bacaKonfig()
  if (!cfg) return Promise.reject(new Error('Konfigurasi server Minecraft belum dipasang.'))
  const url = new URL(cfg.panelUrl + jalur)
  const pustaka = url.protocol === 'http:' ? http : https
  const data = isi === null ? null : Buffer.from(JSON.stringify(isi))
  const opsi = {
    method,
    hostname: url.hostname,
    port: url.port || (url.protocol === 'http:' ? 80 : 443),
    path: url.pathname + url.search,
    headers: {
      Authorization: `Bearer ${cfg.apiKey}`,
      Accept: 'application/json',
      'User-Agent': 'usanagi-umi-mc/1.0',
      ...(data ? { 'Content-Type': 'application/json', 'Content-Length': data.length } : {}),
    },
    timeout: timeoutMs,
  }
  return new Promise((selesai, gagal) => {
    const req = pustaka.request(opsi, (res) => {
      const potongan = []
      res.on('data', (c) => potongan.push(c))
      res.on('end', () => {
        const teks = Buffer.concat(potongan).toString('utf8')
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try { return selesai(JSON.parse(teks)) } catch { return selesai(teks) }
        }
        const pesan = (() => {
          try { return JSON.parse(teks)?.errors?.[0]?.detail || `HTTP ${res.statusCode}` } catch { return `HTTP ${res.statusCode}` }
        })()
        gagal(Object.assign(new Error(pesan), { status: res.statusCode }))
      })
    })
    req.on('timeout', () => req.destroy(new Error('Panel tidak merespons (timeout).')))
    req.on('error', gagal)
    if (data) req.write(data)
    req.end()
  })
}

const dasar = () => `/api/client/servers/${bacaKonfig().serverId}`

/** Ambil teks mentah dari endpoint panel (console.log). */
function permintaanTeks(jalur, timeoutMs = 25000) {
  const cfg = bacaKonfig()
  if (!cfg) return Promise.reject(new Error('Konfigurasi server Minecraft belum dipasang.'))
  const url = new URL(cfg.panelUrl + jalur)
  const pustaka = url.protocol === 'http:' ? http : https
  return new Promise((selesai, gagal) => {
    const req = pustaka.request({
      method: 'GET',
      hostname: url.hostname,
      port: url.port || (url.protocol === 'http:' ? 80 : 443),
      path: url.pathname + url.search,
      headers: {
        Authorization: `Bearer ${cfg.apiKey}`,
        Accept: 'text/plain',
        'User-Agent': 'usanagi-umi-mc/1.0',
      },
      timeout: timeoutMs,
    }, (res) => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        res.resume()
        return gagal(Object.assign(new Error(`HTTP ${res.statusCode}`), { status: res.statusCode }))
      }
      const potongan = []
      res.on('data', (c) => potongan.push(c))
      res.on('end', () => selesai(Buffer.concat(potongan).toString('utf8')))
    })
    req.on('timeout', () => req.destroy(new Error('Panel tidak merespons (timeout).')))
    req.on('error', gagal)
    req.end()
  })
}

/* ── data dasar server ────────────────────────────────────────────────── */

export async function detailServer() {
  const data = await permintaan('GET', dasar())
  const atribut = data?.attributes || data || {}
  return atribut
}

export async function sumberDaya() {
  const data = await permintaan('GET', `${dasar()}/resources`)
  const atribut = data?.attributes || data || {}
  const r = atribut.resources || {}
  return {
    state: atribut.current_state || atribut.state || 'unknown',
    cpu: Number(r.cpu_absolute || 0),
    memoriBita: Number(r.memory_bytes || 0),
    diskBita: Number(r.disk_bytes || 0),
    uptime: Number(r.uptime || 0),
    jaringan: r.network || {},
  }
}

export async function bacaKonsol(byte = 220000) {
  const teks = await permintaanTeks(`${dasar()}/files/contents?file=${encodeURIComponent('/console.log')}`)
  return teks.length > byte ? teks.slice(-byte) : teks
}

/** Kirim satu perintah ke console server (mis. "time set night"). */
export async function kirimPerintah(perintah) {
  const bersih = String(perintah || '').replace(/[\r\n]+/g, ' ').trim()
  if (!bersih) throw new Error('Perintah kosong.')
  await permintaan('POST', `${dasar()}/command`, { command: bersih })
  return bersih
}

export async function dayaServer(sinyal) {
  const izin = ['start', 'stop', 'restart', 'kill']
  const pilih = String(sinyal || '').toLowerCase()
  if (!izin.includes(pilih)) throw new Error('Sinyal harus start/stop/restart/kill.')
  await permintaan('POST', `${dasar()}/power`, { signal: pilih })
  return pilih
}

export function alamatJoin(detail) {
  const cfg = bacaKonfig() || {}
  if (cfg.joinHost && cfg.joinPort) return { host: cfg.joinHost, port: cfg.joinPort }
  const alokasi = detail?.relationships?.allocations?.data || []
  const pertama = alokasi[0]?.attributes || alokasi[0] || {}
  return { host: String(pertama.ip || ''), port: Number(pertama.port || 0) }
}

/* ── pembacaan console.log ────────────────────────────────────────────── */

const RE_VERSI = /Version:\s*(\d+\.\d+\.\d+(?:\.\d+)?)/i
const RE_LEVEL = /Level Name:\s*(.+)$/gim
const RE_ONLINE = /There are (\d+)\/(\d+) players online:?(.*)$/im
const RE_CONNECT = /Player connected:\s*([^,]+?),\s*xuid:\s*(\d+)/g
const RE_DISCONNECT = /Player disconnected:\s*([^,]+?)(?:,\s*xuid:\s*(\d+))?/g
const RE_SPAWN = /Player Spawned:\s*([^\s]+)\s*xuid:\s*(\d+)/g
const RE_MULAI = /Server started\./g

/** Ringkasan dari isi console.log. */
export function uraiKonsol(teks, riwayatLama = null) {
  const isi = String(teks || '')
  /* Versi & nama dunia dibaca dari boot TERAKHIR saja, supaya nilai dari dunia
   * atau versi sebelumnya tidak ikut terbaca. Patokan boot = baris "Version:". */
  const semuaVersi = [...isi.matchAll(/Version:\s*\d+\.\d+\.\d+(?:\.\d+)?/g)]
  const bootTerakhir = semuaVersi.length ? isi.slice(semuaVersi[semuaVersi.length - 1].index) : isi
  const hasil = {
    versi: (bootTerakhir.match(RE_VERSI) || isi.match(RE_VERSI) || [])[1] || '',
    level: (() => {
      const diBoot = [...bootTerakhir.matchAll(RE_LEVEL)]
      const semua = [...isi.matchAll(RE_LEVEL)]
      const m = diBoot.length ? diBoot[diBoot.length - 1] : (semua.length ? semua[semua.length - 1] : null)
      return m && m[1] ? String(m[1]).trim() : ''
    })(),
    online: [],
    maksimal: 0,
    jumlahOnline: 0,
    jumlahRestart: (isi.match(RE_MULAI) || []).length,
    join: [],
    keluar: [],
    galatTerakhir: [],
  }

  const baris = isi.split('\n')
  for (let i = baris.length - 1; i >= 0 && !hasil.online.length; i--) {
    const m = baris[i].match(RE_ONLINE)
    if (m) {
      hasil.jumlahOnline = Number(m[1])
      hasil.maksimal = Number(m[2])
      hasil.online = String(m[3] || '')
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean)
    }
  }

  for (const m of isi.matchAll(RE_CONNECT)) hasil.join.push({ nama: String(m[1]).trim(), xuid: m[2] })
  for (const m of isi.matchAll(RE_SPAWN)) {
    if (!hasil.join.some((x) => x.xuid === m[2])) hasil.join.push({ nama: String(m[1]).trim(), xuid: m[2] })
  }
  for (const m of isi.matchAll(RE_DISCONNECT)) hasil.keluar.push({ nama: String(m[1]).trim(), xuid: m[2] || '' })

  /* Task136 — galat hanya diambil dari SESI BOOT SEKARANG.
   * console.log tidak selalu diputar ulang, jadi galat dari boot kemarin bisa
   * ikut terbaca (mis. SyntaxError addon yang sudah diperbaiki). Patokan sesi
   * = kemunculan terakhir baris "Opening level". Galat yang memang bukan
   * masalah (peringatan pack, alias perintah, pesan khusus pemain) disaring. */
  const penandaSesi = [...isi.matchAll(/Opening level '[^']+'/g)]
  const awalSesi = penandaSesi.length ? penandaSesi[penandaSesi.length - 1].index : 0
  const sesiSekarang = isi.slice(awalSesi)
  /* Panel kadang masih melaporkan "starting" padahal server sudah selesai
   * boot. Console adalah bukti yang lebih kuat: kalau "Server started." ada
   * di sesi ini, server benar-benar jalan. */
  hasil.berjalan = /Server started\./.test(sesiSekarang)
  const ABAIKAN = [
    /Perintah ini hanya untuk pemain/i,
    /issues were found when loading packs/i,
    /Custom Command alias/i,
    /tidak ada event chatSend/i,
    /Content Log file/i,
    /\[Scripting\] \[Umi Survival Kit\] di/i,
  ]
  hasil.galatTerakhir = sesiSekarang
    .split('\n')
    .filter((x) => /\[.*ERROR\]/.test(x) && !ABAIKAN.some((pola) => pola.test(x)))
    .slice(-3)
    .map((x) => x.replace(/^\[([^\]]+)\]\s*/, '[$1] ').slice(-170))

  const riwayat = riwayatLama && typeof riwayatLama === 'object' ? riwayatLama : {}
  const pemain = { ...(riwayat.pemain || {}) }
  const waktu = Date.now()
  for (const orang of hasil.join) {
    const kunci = orang.xuid || orang.nama
    const lama = pemain[kunci] || { nama: orang.nama, xuid: orang.xuid, pertama: waktu, kunjungan: 0, terakhir: waktu }
    pemain[kunci] = {
      nama: orang.nama || lama.nama,
      xuid: orang.xuid || lama.xuid || '',
      pertama: lama.pertama || waktu,
      terakhir: waktu,
      kunjungan: Math.max(Number(lama.kunjungan) || 0, 1),
    }
  }
  for (const orang of hasil.keluar) {
    const kunci = orang.xuid || orang.nama
    if (pemain[kunci]) pemain[kunci].terakhir = waktu
  }

  return { ...hasil, riwayatBaru: { pemain, diperbarui: waktu } }
}

export function bacaRiwayat() {
  try {
    return JSON.parse(fs.readFileSync(BERKAS_RIWAYAT, 'utf8'))
  } catch (error) {
    return { pemain: {}, diperbarui: 0 }
  }
}

export function simpanRiwayat(data) {
  try {
    fs.mkdirSync(path.dirname(BERKAS_RIWAYAT), { recursive: true })
    fs.writeFileSync(BERKAS_RIWAYAT, JSON.stringify(data, null, 2), { mode: 0o600 })
    return true
  } catch (error) {
    return false
  }
}

/** Sinkronkan console.log ke riwayat (dipanggil tiap kali status/join dibaca). */
export async function sinkronRiwayat() {
  const teks = await bacaKonsol()
  const hasil = uraiKonsol(teks, bacaRiwayat())
  simpanRiwayat(hasil.riwayatBaru)
  return hasil
}

/* ── operasi berkas di server MC (addon & world pack) ──────────────────── */

/** Permintaan mentah: body berupa Buffer, balasan selalu Buffer. */
function permintaanMentah(method, jalur, buffer = null, tipe = 'application/octet-stream', timeoutMs = 60000) {
  const cfg = bacaKonfig()
  if (!cfg) return Promise.reject(new Error('Konfigurasi server Minecraft belum dipasang.'))
  const url = new URL(cfg.panelUrl + jalur)
  const pustaka = url.protocol === 'http:' ? http : https
  return new Promise((selesai, gagal) => {
    const req = pustaka.request({
      method,
      hostname: url.hostname,
      port: url.port || (url.protocol === 'http:' ? 80 : 443),
      path: url.pathname + url.search,
      headers: {
        Authorization: `Bearer ${cfg.apiKey}`,
        Accept: '*/*',
        'User-Agent': 'usanagi-umi-mc/1.0',
        ...(buffer ? { 'Content-Type': tipe, 'Content-Length': buffer.length } : {}),
      },
      timeout: timeoutMs,
    }, (res) => {
      const potongan = []
      res.on('data', (c) => potongan.push(c))
      res.on('end', () => {
        const isi = Buffer.concat(potongan)
        if (res.statusCode >= 200 && res.statusCode < 300) return selesai(isi)
        let pesan = `HTTP ${res.statusCode}`
        try { pesan = JSON.parse(isi.toString('utf8'))?.errors?.[0]?.detail || pesan } catch { }
        gagal(Object.assign(new Error(pesan), { status: res.statusCode }))
      })
    })
    req.on('timeout', () => req.destroy(new Error('Panel tidak merespons (timeout).')))
    req.on('error', gagal)
    if (buffer) req.write(buffer)
    req.end()
  })
}

/** Daftar isi satu folder di server MC. */
export async function daftarBerkas(jalur = '/') {
  const data = await permintaan('GET', `${dasar()}/files/list?directory=${encodeURIComponent(jalur)}`)
  const rows = data?.data || []
  return rows.map((row) => ({
    nama: row.attributes?.name || '',
    ukuran: Number(row.attributes?.size || 0),
    folder: row.attributes?.is_file === false,
  })).filter((x) => x.nama)
}

export async function buatFolder(induk, nama) {
  await permintaan('POST', `${dasar()}/files/create-folder`, { root: induk, name: nama })
  return `${induk.replace(/\/$/, '')}/${nama}`
}

export async function tulisBerkas(jalur, buffer) {
  const isi = Buffer.isBuffer(buffer) ? buffer : Buffer.from(String(buffer))
  await permintaanMentah('POST', `${dasar()}/files/write?file=${encodeURIComponent(jalur)}`, isi)
  return isi.length
}

export async function hapusBerkas(daftar) {
  const isi = Array.isArray(daftar) ? daftar : [daftar]
  await permintaan('POST', `${dasar()}/files/delete`, { root: '/', files: isi })
  return isi.length
}

export async function bacaBerkasTeks(jalur) {
  const isi = await permintaanMentah('GET', `${dasar()}/files/contents?file=${encodeURIComponent(jalur)}`, null, 'text/plain')
  return isi.toString('utf8')
}

/* ── perintah pemain ──────────────────────────────────────────────────── */

const bersihNama = (nama) => String(nama || '').replace(/[^A-Za-z0-9_ .-]/g, '').trim().slice(0, 32)

export async function opPemain(nama) {
  const target = bersihNama(nama)
  if (!target) throw new Error('Nama pemain kosong.')
  return kirimPerintah(`op "${target}"`)
}

export async function deopPemain(nama) {
  const target = bersihNama(nama)
  if (!target) throw new Error('Nama pemain kosong.')
  return kirimPerintah(`deop "${target}"`)
}

export async function banPemain(nama, alasan) {
  const target = bersihNama(nama)
  const sebab = String(alasan || '').replace(/["\\]/g, '').trim().slice(0, 80)
  if (!target) throw new Error('Nama pemain kosong.')
  if (!sebab) throw new Error('Alasan ban wajib diisi.')
  return kirimPerintah(`ban "${target}" ${sebab}`)
}

export async function unbanPemain(nama) {
  const target = bersihNama(nama)
  if (!target) throw new Error('Nama pemain kosong.')
  return kirimPerintah(`pardon "${target}"`)
}

export async function kickPemain(nama, alasan) {
  const target = bersihNama(nama)
  const sebab = String(alasan || 'Dikeluarkan oleh admin').replace(/["\\]/g, '').trim().slice(0, 80)
  if (!target) throw new Error('Nama pemain kosong.')
  return kirimPerintah(`kick "${target}" ${sebab}`)
}

/* ── ping jaringan ────────────────────────────────────────────────────── */

function cekTcp(host, port, timeoutMs = 6000) {
  return new Promise((selesai) => {
    const mulai = Date.now()
    const soket = new net.Socket()
    let beres = false
    const tutup = (ok, pesan = '') => {
      if (beres) return
      beres = true
      try { soket.destroy() } catch { }
      selesai({ ok, ms: Date.now() - mulai, pesan })
    }
    soket.setTimeout(timeoutMs)
    soket.once('connect', () => tutup(true))
    soket.once('timeout', () => tutup(false, 'timeout'))
    soket.once('error', (err) => tutup(false, err.code || err.message))
    soket.connect(port, host)
  })
}

function cekJoinHttp(host, port, timeoutMs = 8000) {
  return new Promise((selesai) => {
    const mulai = Date.now()
    const req = http.request({ host, port, path: '/v1/join', method: 'GET', timeout: timeoutMs }, (res) => {
      res.resume()
      res.on('end', () => selesai({ status: res.statusCode, ms: Date.now() - mulai }))
    })
    req.on('timeout', () => req.destroy(new Error('timeout')))
    req.on('error', (err) => selesai({ status: 0, ms: Date.now() - mulai, pesan: err.code || err.message }))
    req.end()
  })
}

/** Ping lengkap: TCP signaling + HTTP /v1/join + status panel. */
export async function pingServer() {
  const detail = await detailServer().catch(() => null)
  const { host, port } = alamatJoin(detail)
  if (!host || !port) throw new Error('Alamat join server belum diketahui.')
  const tcp = await cekTcp(host, port)
  const httpJoin = await cekJoinHttp(host, port)
  return { host, port, tcp, httpJoin, waktu: Date.now() }
}

/* ── ringkasan status untuk pesan WhatsApp ───────────────────────────── */

const bentukUptime = (ms) => {
  const detik = Math.floor(Number(ms || 0) / 1000)
  const hari = Math.floor(detik / 86400)
  const jam = Math.floor((detik % 86400) / 3600)
  const menit = Math.floor((detik % 3600) / 60)
  if (hari) return `${hari}h ${jam}j`
  if (jam) return `${jam}j ${menit}m`
  return `${menit}m`
}

const bentukBita = (bita) => {
  const n = Number(bita || 0)
  if (n >= 1024 ** 3) return `${(n / 1024 ** 3).toFixed(1)} GB`
  return `${Math.round(n / 1024 ** 2)} MB`
}

export async function statusLengkap() {
  const [detail, sumber] = await Promise.all([detailServer(), sumberDaya()])
  const { host, port } = alamatJoin(detail)
  const konsol = await sinkronRiwayat().catch(() => ({ online: [], jumlahOnline: 0, maksimal: 0, versi: '', level: '', galatTerakhir: [], riwayatBaru: bacaRiwayat() }))
  const riwayat = bacaRiwayat()
  const daftar = Object.values(riwayat.pemain || {})
  return {
    nama: bacaKonfig()?.label || detail?.name || 'Minecraft Server',
    panelNama: detail?.name || '',
    state: (String(sumber.state).toLowerCase() === 'starting' && konsol.berjalan) ? 'running' : sumber.state,
    cpu: sumber.cpu,
    memori: bentukBita(sumber.memoriBita),
    disk: bentukBita(sumber.diskBita),
    uptime: bentukUptime(sumber.uptime),
    host,
    port,
    versi: konsol.versi || '-',
    level: konsol.level || '-',
    online: konsol.online || [],
    jumlahOnline: konsol.jumlahOnline || 0,
    maksimal: konsol.maksimal || 0,
    galat: konsol.galatTerakhir || [],
    totalPernah: daftar.length,
    pemain: daftar.sort((a, b) => (b.terakhir || 0) - (a.terakhir || 0)),
  }
}

export function teksStatus(status) {
  const online = status.online.length ? status.online.join(', ') : 'tidak ada'
  return [
    `🎮 *${status.nama}*`,
    '',
    `Status : *${String(status.state).toUpperCase()}*`,
    `Versi  : ${status.versi}`,
    `Dunia  : ${status.level}`,
    `Alamat : ${status.host}:${status.port}`,
    '',
    `Pemain online : ${status.jumlahOnline}/${status.maksimal} — ${online}`,
    `Pernah join   : ${status.totalPernah} pemain`,
    `CPU/RAM/Disk  : ${status.cpu.toFixed(1)}% · ${status.memori} · ${status.disk}`,
    `Uptime panel  : ${status.uptime}`,
    status.galat.length ? `\n⚠️ Error terakhir:\n${status.galat.map((x) => `- ${x}`).join('\n')}` : '',
  ].filter(Boolean).join('\n')
}

export function teksPemain(status, batas = 10) {
  if (!status.pemain.length) return 'Belum ada pemain yang pernah join.'
  const baris = status.pemain.slice(0, batas).map((p, i) => {
    const kapan = p.terakhir ? new Date(p.terakhir).toLocaleString('id-ID', { timeZone: 'Asia/Makassar' }) : '-'
    return `${i + 1}. *${p.nama}*${p.xuid ? ` (${p.xuid})` : ''}\n   terakhir: ${kapan} WITA`
  })
  return [`👥 *Pemain yang pernah join* (${status.totalPernah})`, '', ...baris].join('\n')
}

export function teksPing(ping, status) {
  return [
    '📡 *PING SERVER MC*',
    '',
    `Host  : ${ping.host}:${ping.port}`,
    `TCP signaling : ${ping.tcp.ok ? `✔ ${ping.tcp.ms} ms` : `✘ ${ping.tcp.pesan}`}`,
    `HTTP /v1/join : ${ping.httpJoin.status === 200 ? `✔ 200 (${ping.httpJoin.ms} ms)` : `✘ ${ping.httpJoin.status || ping.httpJoin.pesan}`}`,
    `Panel         : ${String(status.state).toUpperCase()}`,
    `Pemain online : ${status.jumlahOnline}/${status.maksimal}`,
    '',
    ping.tcp.ok && ping.httpJoin.status === 200
      ? 'Server bisa dihubungi dari internet.'
      : 'Server belum bisa dihubungi dari luar — cek alokasi port / status server.',
  ].join('\n')
}
