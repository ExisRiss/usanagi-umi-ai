/* By AlzRiss - Usanagi Umi AI
 *
 * Task136 — deploy situs ke subdomain dari WhatsApp.
 *
 * Alamat yang didukung:
 *   https://<nama>-alzriss.gwenna.my.id   ← dipakai (tercakup SSL Universal)
 *   https://<nama>.alzriss.gwenna.my.id   ← didaftarkan juga, hidup begitu
 *                                           sertifikat Total TLS/ACM aktif
 *
 * Cara kerja:
 *   berkas situs disimpan di server tunnel (panel Kaira) pada `/situs/<nama>/`,
 *   daftar pemilik disimpan di `/situs/registry.json`, lalu satu CNAME
 *   `<nama>-alzriss.gwenna.my.id` dibuat menuju tunnel tersebut.
 *
 * Konfigurasi `data/subdomain-kaira.json`:
 *   { panelUrl, apiKey, serverId, domain, cfToken, cfZone, tunnelId }
 * Berkas ini mode 600 dan tidak masuk repo.
 */

import fs from 'fs'
import path from 'path'
import http from 'http'
import https from 'https'
import { bacaArsip, amanJalur } from './arsip.js'

const BERKAS = path.join(process.cwd(), 'data', 'subdomain-kaira.json')
const DIR_SITUS = '/situs'
const DOMAIN_DASAR = 'alzriss.gwenna.my.id'

let cache = null

export function bacaKonfig(kuatUlang = false) {
  if (cache && !kuatUlang) return cache
  try {
    const isi = JSON.parse(fs.readFileSync(BERKAS, 'utf8'))
    cache = {
      panelUrl: String(isi.panelUrl || '').replace(/\/+$/, ''),
      apiKey: String(isi.apiKey || ''),
      serverId: String(isi.serverId || ''),
      domain: String(isi.domain || DOMAIN_DASAR),
      cfToken: String(isi.cfToken || ''),
      cfZone: String(isi.cfZone || ''),
      tunnelId: String(isi.tunnelId || ''),
      maksBerkas: Number(isi.maksBerkas || 300),
      maksUkuran: Number(isi.maksUkuran || 25 * 1024 * 1024),
    }
  } catch (error) {
    cache = null
  }
  return cache
}

export function subSiap() {
  const cfg = bacaKonfig()
  return Boolean(cfg && cfg.panelUrl && cfg.apiKey && cfg.serverId)
}

/* ── klien panel (khusus berkas) ───────────────────────────────────────── */

function minta(method, jalur, body = null, tipe = 'application/json', timeoutMs = 60000) {
  const cfg = bacaKonfig()
  if (!cfg) return Promise.reject(new Error('Konfigurasi subdomain belum dipasang.'))
  const url = new URL(cfg.panelUrl + jalur)
  const pustaka = url.protocol === 'http:' ? http : https
  const data = body === null ? null : (Buffer.isBuffer(body) ? body : Buffer.from(JSON.stringify(body)))
  return new Promise((selesai, gagal) => {
    const req = pustaka.request({
      method,
      hostname: url.hostname,
      port: url.port || (url.protocol === 'http:' ? 80 : 443),
      path: url.pathname + url.search,
      headers: {
        Authorization: `Bearer ${cfg.apiKey}`,
        Accept: '*/*',
        'User-Agent': 'usanagi-umi-sub/1.0',
        ...(data ? { 'Content-Type': tipe, 'Content-Length': data.length } : {}),
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
    req.on('timeout', () => req.destroy(new Error('Panel lambat merespons (timeout).')))
    req.on('error', gagal)
    if (data) req.write(data)
    req.end()
  })
}

const dasar = () => `/api/client/servers/${bacaKonfig().serverId}`

async function tulisJalur(jalur, isi) {
  const buffer = Buffer.isBuffer(isi) ? isi : Buffer.from(String(isi))
  await minta('POST', `${dasar()}/files/write?file=${encodeURIComponent(jalur)}`, buffer, 'application/octet-stream')
  return buffer.length
}

async function bacaJalur(jalur) {
  return (await minta('GET', `${dasar()}/files/contents?file=${encodeURIComponent(jalur)}`)).toString('utf8')
}

async function hapusJalur(daftar) {
  const isi = Array.isArray(daftar) ? daftar : [daftar]
  return minta('POST', `${dasar()}/files/delete`, { root: '/', files: isi })
}

async function buatFolder(induk, nama) {
  try {
    await minta('POST', `${dasar()}/files/create-folder`, { root: induk, name: nama })
  } catch (error) {
    if (!/sudah|exist/i.test(String(error.message))) throw error
  }
}

/* ── registry ──────────────────────────────────────────────────────────── */

export async function bacaRegistry() {
  try {
    const isi = JSON.parse(await bacaJalur(`${DIR_SITUS}/registry.json`))
    return isi && typeof isi === 'object' ? isi : {}
  } catch (error) {
    return {}
  }
}

export async function simpanRegistry(data) {
  await tulisJalur(`${DIR_SITUS}/registry.json`, JSON.stringify(data, null, 2))
  return data
}

export async function daftarSubdomain() {
  const registry = await bacaRegistry()
  return Object.entries(registry)
    .map(([nama, info]) => ({ nama, ...info }))
    .sort((a, b) => String(a.nama).localeCompare(String(b.nama)))
}

export async function infoSubdomain(nama) {
  const registry = await bacaRegistry()
  return registry[nama] || null
}

/* ── DNS Cloudflare ────────────────────────────────────────────────────── */

function cf(path, method = 'GET', body = null) {
  const cfg = bacaKonfig()
  if (!cfg?.cfToken) return Promise.reject(new Error('Token Cloudflare belum diatur di data/subdomain-kaira.json'))
  return new Promise((selesai, gagal) => {
    const data = body === null ? null : Buffer.from(JSON.stringify(body))
    const req = https.request({
      hostname: 'api.cloudflare.com',
      path: '/client/v4' + path,
      method,
      headers: {
        Authorization: `Bearer ${cfg.cfToken}`,
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': data.length } : {}),
      },
      timeout: 25000,
    }, (res) => {
      const potongan = []
      res.on('data', (c) => potongan.push(c))
      res.on('end', () => {
        let isi = {}
        try { isi = JSON.parse(Buffer.concat(potongan).toString('utf8')) } catch { }
        if (res.statusCode >= 200 && res.statusCode < 300 && isi.success !== false) return selesai(isi)
        const pesan = isi?.errors?.[0]?.message || `HTTP ${res.statusCode}`
        gagal(new Error(`Cloudflare: ${pesan}`))
      })
    })
    req.on('timeout', () => req.destroy(new Error('Cloudflare tidak merespons.')))
    req.on('error', gagal)
    if (data) req.write(data)
    req.end()
  })
}

export function hostUtama(nama) {
  return `${nama}-${DOMAIN_DASAR}`
}

export function hostTitik(nama) {
  return `${nama}.${DOMAIN_DASAR}`
}

/** Pastikan CNAME untuk satu hostname mengarah ke tunnel. */
async function pastikanDns(hostname) {
  const cfg = bacaKonfig()
  if (!cfg?.cfToken || !cfg?.cfZone || !cfg?.tunnelId) return { dilewati: true }
  const target = `${cfg.tunnelId}.cfargotunnel.com`
  const cari = await cf(`/zones/${cfg.cfZone}/dns_records?type=CNAME&name=${encodeURIComponent(hostname)}`)
  const ada = (cari.result || []).find((x) => x.name === hostname)
  if (ada) {
    if (ada.content === target && ada.proxied) return { sudahAda: true, id: ada.id }
    await cf(`/zones/${cfg.cfZone}/dns_records/${ada.id}`, 'PATCH', { content: target, proxied: true })
    return { diperbarui: true, id: ada.id }
  }
  const dibuat = await cf(`/zones/${cfg.cfZone}/dns_records`, 'POST', {
    type: 'CNAME', name: hostname, content: target, proxied: true, ttl: 1,
    comment: 'Task136 deploy subdomain',
  })
  return { dibuat: true, id: dibuat.result?.id }
}

async function hapusDns(hostname) {
  const cfg = bacaKonfig()
  if (!cfg?.cfToken || !cfg?.cfZone) return { dilewati: true }
  const cari = await cf(`/zones/${cfg.cfZone}/dns_records?type=CNAME&name=${encodeURIComponent(hostname)}`)
  const ada = (cari.result || []).find((x) => x.name === hostname)
  if (!ada) return { tidakAda: true }
  await cf(`/zones/${cfg.cfZone}/dns_records/${ada.id}`, 'DELETE')
  return { dihapus: true }
}

/* ── validasi nama ─────────────────────────────────────────────────────── */

export function namaSubAman(nama) {
  const bersih = String(nama || '').toLowerCase().trim()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30)
  if (!bersih || bersih.length < 3) return ''
  if (/^\d+$/.test(bersih)) return ''
  const terlarang = ['www', 'api', 'admin', 'mail', 'ftp', 'jadibot', 'tunel', 'alzriss', 'game', 'upload']
  if (terlarang.includes(bersih)) return ''
  return bersih
}

/**
 * Ubah isi unggahan user menjadi daftar berkas situs.
 * Menerima: HTML mentah (teks), satu berkas .html, atau arsip zip/tar.gz.
 */
export function siapkanBerkas(buffer, namaBerkas = '', teks = '') {
  const cfg = bacaKonfig() || {}
  const maksUkuran = cfg.maksUkuran || 25 * 1024 * 1024
  if (buffer && buffer.length > maksUkuran) {
    throw new Error(`Berkas terlalu besar (${(buffer.length / 1024 / 1024).toFixed(1)} MB, maksimal ${Math.round(maksUkuran / 1024 / 1024)} MB).`)
  }
  const rendah = String(namaBerkas || '').toLowerCase()

  if (!buffer && teks && teks.trim()) {
    const isi = teks.trim()
    if (!/<[a-z!/]/i.test(isi)) throw new Error('Teks yang dikirim bukan kode HTML.')
    return [{ jalur: 'index.html', data: Buffer.from(isi, 'utf8') }]
  }
  if (!buffer || !buffer.length) throw new Error('Tidak ada berkas yang dikirim.')

  if (/\.(html?|css|js|json|txt|svg)$/.test(rendah)) {
    const nama = amanJalur(namaBerkas) || 'index.html'
    return [{ jalur: /index\.html?$/i.test(nama) ? 'index.html' : nama, data: buffer }]
  }

  const arsip = bacaArsip(buffer, namaBerkas)
  const berkas = arsip.berkas
    .map((item) => ({ jalur: amanJalur(item.jalur), data: item.data }))
    .filter((item) => item.jalur)
  if (!berkas.length) throw new Error('Arsip kosong.')
  if (berkas.length > (cfg.maksBerkas || 300)) throw new Error(`Terlalu banyak berkas (${berkas.length}). Maksimal ${cfg.maksBerkas || 300}.`)

  /* Kalau semua berkas ada di dalam satu folder induk, folder itu dibuang
   * supaya index.html berada di akar situs. */
  const punyaIndexAkar = berkas.some((b) => b.jalur === 'index.html' || b.jalur === 'index.htm')
  if (!punyaIndexAkar) {
    const pertama = berkas[0].jalur.split('/')[0]
    const semuaSatuFolder = berkas.every((b) => b.jalur.includes('/') && b.jalur.split('/')[0] === pertama)
    if (semuaSatuFolder) {
      for (const b of berkas) b.jalur = b.jalur.slice(pertama.length + 1)
    }
  }
  if (!berkas.some((b) => /^index\.html?$/i.test(b.jalur))) {
    throw new Error('Arsip tidak punya index.html di akar. Tambahkan index.html lalu deploy ulang.')
  }
  return berkas
}

/* ── deploy / hapus / status ───────────────────────────────────────────── */

export async function deploySubdomain({ nama, berkas, pemilik, judul = '', mode = 'baru' }) {
  const sub = namaSubAman(nama)
  if (!sub) throw new Error('Nama subdomain tidak valid (3–30 huruf/angka, tidak boleh angka saja).')

  const folder = `${DIR_SITUS}/${sub}`
  await buatFolder(DIR_SITUS, sub)

  /* Bersihkan isi lama supaya berkas nyasar tidak tertinggal. */
  if (mode !== 'baru') {
    try { await hapusJalur([folder]) } catch { }
    await buatFolder(DIR_SITUS, sub)
  }

  let total = 0
  for (const item of berkas) {
    const jalur = amanJalur(item.jalur)
    if (!jalur) continue
    const bagian = jalur.split('/')
    if (bagian.length > 1) {
      let induk = folder
      for (const potong of bagian.slice(0, -1)) {
        await buatFolder(induk, potong)
        induk = `${induk}/${potong}`
      }
    }
    total += await tulisJalur(`${folder}/${jalur}`, item.data)
  }

  const dns = []
  for (const host of [hostUtama(sub), hostTitik(sub)]) {
    try { dns.push({ host, ...(await pastikanDns(host)) }) } catch (error) { dns.push({ host, galat: error.message }) }
  }

  const registry = await bacaRegistry()
  const lama = registry[sub] || {}
  const waktu = Date.now()
  registry[sub] = {
    pemilik: pemilik || lama.pemilik || '',
    judul: judul || lama.judul || sub,
    dibuat: lama.dibuat || waktu,
    diperbarui: waktu,
    berkas: berkas.length,
    ukuran: total,
    status: 'aktif',
    deployKe: Number(lama.deployKe || 0) + 1,
  }
  await simpanRegistry(registry)

  return { nama: sub, url: `https://${hostUtama(sub)}/`, urlTitik: `https://${hostTitik(sub)}/`, berkas: berkas.length, ukuran: total, dns, info: registry[sub] }
}

export async function hapusSubdomain(nama) {
  const sub = namaSubAman(nama)
  if (!sub) throw new Error('Nama subdomain tidak valid.')
  const registry = await bacaRegistry()
  if (!registry[sub]) throw new Error(`Subdomain "${sub}" tidak terdaftar.`)
  try { await hapusJalur([`${DIR_SITUS}/${sub}`]) } catch (error) { }
  const dns = []
  for (const host of [hostUtama(sub), hostTitik(sub)]) {
    try { dns.push({ host, ...(await hapusDns(host)) }) } catch (error) { dns.push({ host, galat: error.message }) }
  }
  delete registry[sub]
  await simpanRegistry(registry)
  return { nama: sub, dns }
}

export async function aturStatusSubdomain(nama, status) {
  const sub = namaSubAman(nama)
  const registry = await bacaRegistry()
  if (!registry[sub]) throw new Error(`Subdomain "${sub}" tidak terdaftar.`)
  const nilai = status === 'aktif' ? 'aktif' : 'nonaktif'
  registry[sub].status = nilai
  registry[sub].diperbarui = Date.now()
  await simpanRegistry(registry)
  return { nama: sub, status: nilai }
}

export function daftarBerkasSitus(nama) {
  return `${DIR_SITUS}/${namaSubAman(nama)}`
}
