/* Task135 — test kontrol server MC + saklar bot per sesi.
 * Netral jaringan: hanya menguji parsing, format pesan, dan penyimpanan saklar.
 * Jalankan: node --test tests/task135-mc.test.mjs
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const kerja = fs.mkdtempSync(path.join(os.tmpdir(), 'umi-task135-'))
process.chdir(kerja)

const mc = await import('../lib/mc-kaira.js')
const power = await import('../lib/bot-power.js')

const CONTOH = [
  '[2026-10-28 01:59:20:750 INFO] Version: 1.26.52.3',
  '[2026-10-28 01:59:20:800 INFO] Level Name: Survival Santai',
  '[2026-10-28 02:53:36:925 INFO] Player connected: ExisDay, xuid: 2535441844091442',
  '[2026-10-28 02:53:44:463 INFO] Player Spawned: ExisDay xuid: 2535441844091442, pfid: 62B97E88ACD00645',
  '[2026-10-28 03:00:00:000 INFO] There are 1/10 players online: ExisDay',
  '[2026-10-28 03:10:00:000 INFO] Player connected: Budi, xuid: 111222333444555',
  '[2026-10-28 03:11:00:000 ERROR] Something failed',
  '[2026-10-28 03:12:00:000 INFO] Player disconnected: Budi, xuid: 111222333444555',
  '[2026-10-28 03:13:00:000 INFO] There are 1/10 players online: ExisDay',
  '[2026-10-28 03:14:00:000 INFO] Server started.',
].join('\n')

test('uraiKonsol membaca versi, dunia, pemain online, dan riwayat join', () => {
  const hasil = mc.uraiKonsol(CONTOH)
  assert.equal(hasil.versi, '1.26.52.3')
  assert.equal(hasil.level, 'Survival Santai')
  assert.equal(hasil.jumlahOnline, 1)
  assert.equal(hasil.maksimal, 10)
  assert.deepEqual(hasil.online, ['ExisDay'])
  assert.equal(hasil.jumlahRestart, 1)
  assert.equal(hasil.galatTerakhir.length, 1)
  const nama = Object.values(hasil.riwayatBaru.pemain).map((p) => p.nama).sort()
  assert.deepEqual(nama, ['Budi', 'ExisDay'])
})

test('riwayat digabung antar-pembacaan (pemain lama tidak hilang)', () => {
  const pertama = mc.uraiKonsol(CONTOH)
  const kedua = mc.uraiKonsol('[2026-10-28 04:00:00:000 INFO] Player connected: Citra, xuid: 999', pertama.riwayatBaru)
  const nama = Object.values(kedua.riwayatBaru.pemain).map((p) => p.nama).sort()
  assert.deepEqual(nama, ['Budi', 'Citra', 'ExisDay'])
})

test('simpanRiwayat + bacaRiwayat bertahan di berkas', () => {
  const hasil = mc.uraiKonsol(CONTOH)
  assert.equal(mc.simpanRiwayat(hasil.riwayatBaru), true)
  const balik = mc.bacaRiwayat()
  assert.equal(Object.keys(balik.pemain).length, 2)
})

test('teksStatus memuat data penting dan teksPemain menampilkan riwayat', () => {
  const status = {
    nama: 'Survival Santai', state: 'running', versi: '1.26.52.3', level: 'Survival Santai',
    host: '172.232.250.118', port: 26362, online: ['ExisDay'], jumlahOnline: 1, maksimal: 10,
    totalPernah: 2, cpu: 3.2, memori: '812 MB', disk: '2.1 GB', uptime: '3j 4m', galat: [],
    pemain: [
      { nama: 'ExisDay', xuid: '2535441844091442', terakhir: Date.now() },
      { nama: 'Budi', xuid: '111222333444555', terakhir: Date.now() - 600000 },
    ],
  }
  const teks = mc.teksStatus(status)
  assert.match(teks, /Survival Santai/)
  assert.match(teks, /172\.232\.250\.118:26362/)
  assert.match(teks, /1\/10/)
  const orang = mc.teksPemain(status)
  assert.match(orang, /ExisDay/)
  assert.match(orang, /Budi/)
  assert.match(orang, /Pemain yang pernah join\*? \(2\)/)
})

test('teksPing membedakan server sehat dan tidak terjangkau', () => {
  const sehat = mc.teksPing({ host: 'h', port: 1, tcp: { ok: true, ms: 20 }, httpJoin: { status: 200, ms: 30 } }, { state: 'running', jumlahOnline: 1, maksimal: 10 })
  assert.match(sehat, /✔/)
  assert.match(sehat, /bisa dihubungi dari internet/)
  const mati = mc.teksPing({ host: 'h', port: 1, tcp: { ok: false, pesan: 'ETIMEDOUT' }, httpJoin: { status: 0, pesan: 'ECONNREFUSED' } }, { state: 'stopped', jumlahOnline: 0, maksimal: 10 })
  assert.match(mati, /✘/)
  assert.match(mati, /belum bisa dihubungi dari luar/)
})

test('konfigSiap menolak konfigurasi kosong dan menerima yang lengkap', () => {
  assert.equal(mc.konfigSiap(), false)
  fs.mkdirSync(path.join(kerja, 'data'), { recursive: true })
  fs.writeFileSync(path.join(kerja, 'data', 'mc-kaira.json'), JSON.stringify({
    panelUrl: 'https://panel2.kaira.my.id', apiKey: 'uji', serverId: '3ef46b56', joinHost: '172.232.250.118', joinPort: 26362,
  }))
  mc.bacaKonfig(true)
  assert.equal(mc.konfigSiap(), true)
  assert.deepEqual(mc.alamatJoin(null), { host: '172.232.250.118', port: 26362 })
})

test('saklar bot: bawaan nyala, bisa dimatikan per sesi tanpa mengganggu sesi lain', () => {
  assert.equal(power.powerNyala('main'), true)
  power.setPower('jadibot:628111', false, 'uji')
  assert.equal(power.powerNyala('jadibot:628111'), false)
  assert.equal(power.powerNyala('main'), true, 'sesi lain tidak boleh ikut mati')
  assert.equal(power.powerNyala('jadibot:628222'), true)
  power.setPower('jadibot:628111', true, 'uji')
  assert.equal(power.powerNyala('jadibot:628111'), true)
})

test('perintahPower mengenali prefix tunggal & ganda', () => {
  assert.equal(power.perintahPower('.bot on'), 'on')
  assert.equal(power.perintahPower('..bot off'), 'off')
  assert.equal(power.perintahPower('/bot status'), 'status')
  assert.equal(power.perintahPower('.bot mati'), 'off')
  assert.equal(power.perintahPower('.menu'), null)
  assert.equal(power.perintahPower('bot on'), null)
})

test('scopeDariConfig stabil untuk bot utama dan jadibot', () => {
  assert.equal(power.scopeDariConfig({ type: 'main', scope: 'main' }), 'main')
  assert.equal(power.scopeDariConfig({ type: 'jadibot', scope: 'jadibot:628999' }), 'jadibot:628999')
  assert.equal(power.scopeDariNomor('+62 811-222'), 'jadibot:62811222')
})
