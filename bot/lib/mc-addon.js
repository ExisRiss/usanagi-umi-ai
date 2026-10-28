/* By AlzRiss - Usanagi Umi AI
 *
 * Task136 — pasang / hapus addon Minecraft dari WhatsApp.
 *
 * Alur `.addaddon`:
 *   1. user membalas file .mcaddon/.mcpack/.zip
 *   2. bot membongkar arsip (lib/arsip.js — tanpa biner luar)
 *   3. setiap folder yang punya `manifest.json` dikenali sebagai behaviour pack
 *      (module "data"/"script") atau resource pack (module "resources")
 *   4. berkas diunggah ke `/behavior_packs/<nama>` atau `/resource_packs/<nama>`
 *   5. pack didaftarkan ke `worlds/<dunia>/world_behavior_packs.json` supaya
 *      ikut termuat saat server dinyalakan
 *
 * Semua nama divalidasi: tidak boleh ada `..`, garis miring, atau karakter aneh.
 */

import {
  daftarBerkas,
  tulisBerkas,
  hapusBerkas,
  bacaBerkasTeks,
  buatFolder,
} from './mc-kaira.js'
import { bacaArsip, amanJalur } from './arsip.js'

const PACK_BAWAAN = /^(vanilla|chemistry|editor|experimental_|server_library|server_ui_library|server_editor_library)/i

export function namaAman(nama) {
  const bersih = String(nama || '')
    .replace(/\.(mcaddon|mcpack|zip|tar\.gz|tgz|tar)$/i, '')
    .replace(/[^A-Za-z0-9 _.-]/g, '')
    .replace(/^[.\-\s]+/, '')
    .trim()
    .slice(0, 40)
  return bersih || ''
}

/** Tebak jenis pack dari isi manifest. */
export function jenisPack(manifest) {
  const modul = Array.isArray(manifest?.modules) ? manifest.modules : []
  const tipe = modul.map((m) => String(m?.type || '').toLowerCase())
  if (tipe.some((t) => t === 'resources' || t === 'client_data')) return 'resource'
  if (tipe.some((t) => t === 'data' || t === 'script' || t === 'javascript')) return 'behavior'
  return 'behavior'
}

/** Kelompokkan isi arsip -> [{ folder, jenis, manifest, berkas: [{rel, data}] }] */
export function kelompokkanPack(berkas) {
  const packs = new Map()
  for (const item of berkas) {
    const jalur = amanJalur(item.jalur)
    if (!jalur) continue
    const bagian = jalur.split('/')
    const indeksManifest = bagian.lastIndexOf('manifest.json')
    if (indeksManifest < 0) continue
    const folder = bagian.slice(0, indeksManifest).join('/') || '__akar__'
    let manifest
    try { manifest = JSON.parse(item.data.toString('utf8')) } catch { continue }
    packs.set(folder, { folder, manifest })
  }

  const hasil = []
  for (const pack of packs.values()) {
    const akar = pack.folder === '__akar__' ? '' : pack.folder + '/'
    const isi = berkas
      .map((item) => ({ rel: amanJalur(item.jalur), data: item.data }))
      .filter((item) => item.rel && item.rel.startsWith(akar))
      .map((item) => ({ rel: item.rel.slice(akar.length), data: item.data }))
    if (!isi.length) continue
    const judul = String(pack.manifest?.header?.name || pack.folder || 'addon')
    hasil.push({
      folder: namaAman(judul) || namaAman(pack.folder) || 'addon',
      jenis: jenisPack(pack.manifest),
      manifest: pack.manifest,
      berkas: isi,
    })
  }
  return hasil
}

function daftarPackDunia(jenis, level) {
  const nama = jenis === 'resource' ? 'world_resource_packs.json' : 'world_behavior_packs.json'
  return `/worlds/${level}/${nama}`
}

async function bacaJsonAman(jalur) {
  try {
    const teks = await bacaBerkasTeks(jalur)
    const isi = JSON.parse(teks)
    return Array.isArray(isi) ? isi : []
  } catch (error) {
    return []
  }
}

/**
 * Pasang satu addon.
 * @param {Buffer} buffer isi berkas dari WhatsApp
 * @param {string} namaBerkas nama asli (untuk pesan)
 * @param {string} level nama dunia aktif (mis. "Survival Santai")
 */
export async function pasangAddon(buffer, namaBerkas, level) {
  const arsip = bacaArsip(buffer, namaBerkas)
  if (!arsip.berkas.length) throw new Error('Arsip kosong atau tidak bisa dibaca.')
  const packs = kelompokkanPack(arsip.berkas)
  if (!packs.length) throw new Error('Tidak ada manifest.json di dalam arsip — ini bukan addon Minecraft Bedrock.')

  const laporan = []
  for (const pack of packs) {
    const induk = pack.jenis === 'resource' ? '/resource_packs' : '/behavior_packs'
    const tujuan = `${induk}/${pack.folder}`
    let terpasang = 0
    for (const berkas of pack.berkas) {
      const bersih = amanJalur(berkas.rel)
      if (!bersih) continue
      await tulisBerkas(`${tujuan}/${bersih}`, berkas.data)
      terpasang++
    }

    const uuid = String(pack.manifest?.header?.uuid || '')
    const versi = Array.isArray(pack.manifest?.header?.version) ? pack.manifest.header.version : [1, 0, 0]
    let terdaftar = false
    if (uuid && level) {
      const jalurDaftar = daftarPackDunia(pack.jenis, level)
      const daftar = await bacaJsonAman(jalurDaftar)
      if (!daftar.some((x) => String(x.pack_id || '').toLowerCase() === uuid.toLowerCase())) {
        daftar.push({ pack_id: uuid, version: versi })
        await tulisBerkas(jalurDaftar, JSON.stringify(daftar, null, 2))
        terdaftar = true
      }
    }

    laporan.push({
      nama: pack.folder,
      jenis: pack.jenis,
      folder: tujuan,
      berkas: terpasang,
      uuid,
      terdaftar,
    })
  }
  return { format: arsip.format, packs: laporan }
}

/** Daftar addon yang terpasang di server (yang bukan bawaan BDS). */
export async function daftarAddon() {
  const hasil = []
  for (const [jenis, induk] of [['behavior', '/behavior_packs'], ['resource', '/resource_packs']]) {
    let isi = []
    try { isi = await daftarBerkas(induk) } catch { continue }
    for (const item of isi) {
      if (!item.folder || PACK_BAWAAN.test(item.nama)) continue
      let manifest = null
      try { manifest = JSON.parse(await bacaBerkasTeks(`${induk}/${item.nama}/manifest.json`)) } catch { }
      hasil.push({
        nama: item.nama,
        jenis,
        folder: `${induk}/${item.nama}`,
        judul: String(manifest?.header?.name || item.nama),
        versi: Array.isArray(manifest?.header?.version) ? manifest.header.version.join('.') : '-',
        uuid: String(manifest?.header?.uuid || ''),
      })
    }
  }
  return hasil.sort((a, b) => a.nama.localeCompare(b.nama))
}

/** Hapus addon + cabut pendaftarannya dari dunia. */
export async function hapusAddon(nama, level) {
  const target = String(nama || '').trim()
  if (!target) throw new Error('Nama addon kosong.')
  const daftar = await daftarAddon()
  const ketemu = daftar.find((x) => x.nama.toLowerCase() === target.toLowerCase())
  if (!ketemu) throw new Error(`Addon "${target}" tidak ada di server.`)

  if (ketemu.uuid && level) {
    for (const jenis of ['behavior', 'resource']) {
      const jalur = daftarPackDunia(jenis, level)
      const isi = await bacaJsonAman(jalur)
      const sisa = isi.filter((x) => String(x.pack_id || '').toLowerCase() !== ketemu.uuid.toLowerCase())
      if (sisa.length !== isi.length) await tulisBerkas(jalur, JSON.stringify(sisa, null, 2))
    }
  }
  await hapusBerkas([ketemu.folder])
  return ketemu
}

export { buatFolder }
