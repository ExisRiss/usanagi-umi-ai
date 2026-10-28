/* Task136 — uji logika yang tidak butuh WhatsApp:
 *   arsip (zip/tar.gz), pengenalan addon, validasi subdomain, allmenu tanpa alias.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

import { bacaArsip, tebakFormat, amanJalur } from '../lib/arsip.js'
import { kelompokkanPack, jenisPack, namaAman } from '../lib/mc-addon.js'
import { namaSubAman, siapkanBerkas } from '../lib/subdomain-kaira.js'

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'task136-'))

function buatZip(nama, isi) {
  // isi: [[jalur, string]]
  const akar = fs.mkdtempSync(path.join(tmp, 'zip-'))
  for (const [rel, data] of isi) {
    const jalur = path.join(akar, rel)
    fs.mkdirSync(path.dirname(jalur), { recursive: true })
    fs.writeFileSync(jalur, data)
  }
  const keluar = path.join(tmp, nama)
  execFileSync('zip', ['-qr', keluar, '.'], { cwd: akar })
  return fs.readFileSync(keluar)
}

function buatTarGz(nama, isi) {
  const akar = fs.mkdtempSync(path.join(tmp, 'tar-'))
  for (const [rel, data] of isi) {
    const jalur = path.join(akar, rel)
    fs.mkdirSync(path.dirname(jalur), { recursive: true })
    fs.writeFileSync(jalur, data)
  }
  const keluar = path.join(tmp, nama)
  execFileSync('tar', ['czf', keluar, '-C', akar, '.'])
  return fs.readFileSync(keluar)
}

test('arsip: ZIP terbaca', () => {
  const buf = buatZip('uji.zip', [['a.txt', 'halo'], ['sub/b.txt', 'dunia']])
  assert.equal(tebakFormat(buf), 'zip')
  const hasil = bacaArsip(buf, 'uji.zip')
  const peta = Object.fromEntries(hasil.berkas.map((b) => [b.jalur.replace(/^\.\//, ''), b.data.toString()]))
  assert.equal(peta['a.txt'], 'halo')
  assert.equal(peta['sub/b.txt'], 'dunia')
})

test('arsip: TAR.GZ terbaca', () => {
  const buf = buatTarGz('uji.tar.gz', [['index.html', '<h1>hai</h1>']])
  assert.equal(tebakFormat(buf), 'tar.gz')
  const hasil = bacaArsip(buf, 'uji.tar.gz')
  const isi = hasil.berkas.find((b) => b.jalur.endsWith('index.html'))
  assert.ok(isi)
  assert.match(isi.data.toString(), /hai/)
})

test('arsip: .7z ditolak dengan pesan jelas', () => {
  const buf = Buffer.from([0x37, 0x7a, 0xbc, 0xaf, 0x27, 0x1c, 0x00, 0x04])
  assert.throws(() => bacaArsip(buf, 'a.7z'), /7z/)
})

test('amanJalur membuang path traversal', () => {
  assert.equal(amanJalur('../../etc/passwd'), 'etc/passwd')
  assert.equal(amanJalur('__MACOSX/x'), '')
})

test('addon: behaviour + resource dikenali dari manifest', () => {
  const manifesData = JSON.stringify({ header: { name: 'Umi Pack', uuid: 'abc', version: [1, 2, 0] }, modules: [{ type: 'data' }] })
  const manifesRes = JSON.stringify({ header: { name: 'Umi Textures', uuid: 'def', version: [2, 0, 0] }, modules: [{ type: 'resources' }] })
  const buf = buatZip('addon.mcaddon', [
    ['UmiPack/manifest.json', manifesData],
    ['UmiPack/scripts/main.js', 'console.log(1)'],
    ['UmiTextures/manifest.json', manifesRes],
    ['UmiTextures/textures/a.png', 'x'],
  ])
  const arsip = bacaArsip(buf, 'addon.mcaddon')
  const packs = kelompokkanPack(arsip.berkas)
  assert.equal(packs.length, 2)
  const behavior = packs.find((p) => p.jenis === 'behavior')
  const resource = packs.find((p) => p.jenis === 'resource')
  assert.equal(behavior.folder, 'Umi Pack')
  assert.equal(resource.folder, 'Umi Textures')
  assert.equal(behavior.berkas.length, 2)
  assert.equal(jenisPack({ modules: [{ type: 'script' }] }), 'behavior')
  assert.equal(namaAman('../../jahat.mcpack'), 'jahat')
})

test('addon: arsip tanpa manifest ditolak', () => {
  const buf = buatZip('bukan.mcpack', [['readme.txt', 'bukan addon']])
  assert.equal(kelompokkanPack(bacaArsip(buf, 'bukan.mcpack').berkas).length, 0)
})

test('subdomain: nama divalidasi', () => {
  assert.equal(namaSubAman('toko-umi'), 'toko-umi')
  assert.equal(namaSubAman('Toko Umi!'), 'toko-umi')
  assert.equal(namaSubAman('ab'), '')
  assert.equal(namaSubAman('12345'), '')
  assert.equal(namaSubAman('www'), '')
  assert.equal(namaSubAman('jadibot'), '')
})

test('subdomain: HTML mentah jadi index.html', () => {
  const berkas = siapkanBerkas(null, '', '<!doctype html><h1>hai</h1>')
  assert.equal(berkas.length, 1)
  assert.equal(berkas[0].jalur, 'index.html')
})

test('subdomain: teks non-HTML ditolak', () => {
  assert.throws(() => siapkanBerkas(null, '', 'halo ini bukan html'), /bukan kode HTML/)
})

test('subdomain: zip dengan satu folder induk diratakan', () => {
  const buf = buatZip('web.zip', [
    ['situs/index.html', '<h1>a</h1>'],
    ['situs/assets/app.js', 'x'],
  ])
  const berkas = siapkanBerkas(buf, 'web.zip', '')
  const jalur = berkas.map((b) => b.jalur).sort()
  assert.deepEqual(jalur, ['assets/app.js', 'index.html'])
})

test('subdomain: zip tanpa index.html ditolak', () => {
  const buf = buatZip('tanpa.zip', [['halo.txt', 'x']])
  assert.throws(() => siapkanBerkas(buf, 'tanpa.zip', ''), /index\.html/)
})
