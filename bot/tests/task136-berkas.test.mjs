/* Task136 — uji jalur "bot menerima berkas setelah .deploysubdomain".
 *
 * Dua hal yang dulu bikin bot diam total:
 *   1. handler.js berhenti di gerbang "chat pribadi tanpa prefix" sebelum hook
 *      plugin jalan → sekarang ada registry aksi tertunda yang diperiksa lebih
 *      dahulu (diuji lewat urutan kode di handler.js).
 *   2. `m.mimetype` tidak pernah ada di pesan masuk → deteksi berkas selalu
 *      false. Sekarang memakai `m.mediaMessage` / `m.mtype` (diuji langsung).
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { adaLampiran, namaBerkasLampiran, mimeLampiran, tampakHtml, sumberLampiran } from '../lib/lampiran.js'
import { daftarkanAksi, lepasAksi, cariAksi } from '../lib/pending-aksi.js'

/* Bentuk pesan mengikuti lib/simple.js: ada mtype, msg, mediaMessage — dan
 * sengaja TIDAK ada m.mimetype (persis seperti aslinya). */
function pesanDokumen({ nama = 'web.zip', mime = 'application/zip', caption = '' } = {}) {
  return {
    mtype: 'documentMessage',
    msg: { fileName: nama, mimetype: mime, caption, url: 'https://mmg.example/x' },
    message: { documentMessage: { fileName: nama, mimetype: mime, caption } },
    mediaMessage: { documentMessage: { fileName: nama, mimetype: mime, caption } },
    text: caption,
  }
}

function pesanTeks(teks) {
  return { mtype: 'conversation', msg: { conversation: teks }, message: { conversation: teks }, text: teks }
}

test('dokumen dikenali walau m.mimetype tidak ada', () => {
  const m = pesanDokumen()
  assert.equal('mimetype' in m, false)
  assert.equal(adaLampiran(m), true)
  assert.equal(namaBerkasLampiran(m), 'web.zip')
  assert.equal(mimeLampiran(m), 'application/zip')
})

test('dokumen terbungkus documentWithCaptionMessage dikenali', () => {
  const m = {
    mtype: 'documentWithCaptionMessage',
    msg: { fileName: 'situs.html', mimetype: 'text/html' },
    message: { documentWithCaptionMessage: { message: { documentMessage: { fileName: 'situs.html', mimetype: 'text/html' } } } },
    text: '',
  }
  assert.equal(adaLampiran(m), true)
  assert.equal(namaBerkasLampiran(m), 'situs.html')
})

test('pesan teks biasa bukan lampiran', () => {
  const m = pesanTeks('halo kak')
  assert.equal(adaLampiran(m), false)
  assert.equal(tampakHtml(m.text), false)
})

test('kode HTML di chat dikenali', () => {
  assert.equal(tampakHtml('<!DOCTYPE html><h1>hai</h1>'), true)
  assert.equal(tampakHtml('  <html>'), true)
  assert.equal(tampakHtml('<div class="a">x</div>'), true)
  assert.equal(tampakHtml('deploy dong https://a.com'), false)
  assert.equal(tampakHtml(''), false)
  /* user kadang menempel kode setelah kalimat pembuka */
  assert.equal(tampakHtml('nih kodenya: <!doctype html><h1>x</h1>'), true)
  assert.equal(tampakHtml('ini web saya\n<html>'), true)
})

test('lampiran dari pesan yang dikutip tetap terbaca', () => {
  const m = { mtype: 'extendedTextMessage', msg: { extendedTextMessage: { text: '.deploysubdomain toko' } }, text: '.deploysubdomain toko' }
  m.quoted = pesanDokumen({ nama: 'web.zip' })
  assert.equal(adaLampiran(m), true)
  assert.equal(sumberLampiran(m), m.quoted)
  assert.equal(namaBerkasLampiran(m), 'web.zip')
})

test('registry: hanya mengklaim pesan yang cocok', () => {
  const dipanggil = []
  lepasAksi('uji')
  daftarkanAksi('uji', (m) => {
    if (!adaLampiran(m)) return null
    dipanggil.push(namaBerkasLampiran(m))
    return { jalankan: async () => true }
  })
  assert.equal(cariAksi(pesanTeks('hai')), null)
  const hasil = cariAksi(pesanDokumen({ nama: 'a.zip' }))
  assert.ok(hasil && typeof hasil.jalankan === 'function')
  assert.equal(hasil.nama, 'uji')
  assert.deepEqual(dipanggil, ['a.zip'])
  lepasAksi('uji')
  assert.equal(cariAksi(pesanDokumen()), null)
})

test('handler.js memeriksa aksi tertunda SEBELUM gerbang chat pribadi', () => {
  const sumber = fs.readFileSync(new URL('../handler.js', import.meta.url), 'utf8')
  const posisiPending = sumber.indexOf('cariAksi(m)')
  const posisiGerbang = sumber.indexOf('const realmAccessCommand = isRealmAccessCommand')
  assert.ok(posisiPending > 0, 'pemanggilan cariAksi tidak ditemukan di handler.js')
  assert.ok(posisiGerbang > 0, 'gerbang chat pribadi tidak ditemukan')
  assert.ok(posisiPending < posisiGerbang, 'cariAksi harus lebih dulu daripada gerbang chat pribadi')
  assert.match(sumber, /_aksiPending\.jalankan\.call\(this, m\)/)
})
