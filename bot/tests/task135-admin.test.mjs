/* Task135 — test jadwal grup (settime/setzona/tutupgc) + role akses.
 * Jalankan: node --test tests/task135-admin.test.mjs
 */
import test from 'node:test'
import assert from 'node:assert/strict'

import jadwal, { waktuDi, jalankanJadwal, semuaSoket } from '../plugins/group/group-jadwalbukatutup.js'
import akses from '../plugins/owner/umi-akses.js'

function fixture({ jid = 'g1@g.us', sender = '628111111111@s.whatsapp.net', users = {} } = {}) {
  let tulisan = 0
  global.db = { data: { chats: {}, users }, write: async () => { tulisan++ } }
  const update = []
  const notif = []
  const balasan = []
  const conn = {
    groupSettingUpdate: async (g, nilai) => { update.push([g, nilai]) },
    sendMessage: async (g, body) => { notif.push(body.text) },
  }
  global.conn = conn
  global.jadibotConns = new Map()
  const m = {
    chat: jid,
    sender,
    isGroup: true,
    mentionedJid: [],
    quoted: null,
    reply: async (teks) => { balasan.push(String(teks)); return {} },
  }
  return { m, conn, update, notif, balasan, tulisan, conns: () => global.jadibotConns }
}

const panggil = (m, command, args = [], extra = {}) =>
  jadwal(m, { command, args, text: args.join(' '), conn: extra.conn || global.conn, ...extra })

test('waktuDi mengikuti zona dan jatuh ke Asia/Jakarta untuk zona tak dikenal', () => {
  assert.match(waktuDi('Asia/Makassar'), /^\d{2}:\d{2}$/)
  assert.match(waktuDi('Zona/Ngawur'), /^\d{2}:\d{2}$/)
})

test('settime buka & tutup menyimpan jadwal, format salah ditolak', async () => {
  const f = fixture({ jid: 'sett@g.us' })
  await panggil(f.m, 'settime', ['buka', '08:00'])
  assert.equal(global.db.data.chats['sett@g.us'].openTime, '08:00')
  await panggil(f.m, 'settime', ['tutup', '22:30'])
  assert.equal(global.db.data.chats['sett@g.us'].closeTime, '22:30')

  const sebelum = f.balasan.length
  await panggil(f.m, 'settime', ['tutup', '25:99'])
  assert.equal(global.db.data.chats['sett@g.us'].closeTime, '22:30', 'jadwal lama tidak boleh berubah')
  assert.match(f.balasan[sebelum], /format jam salah/i)
})

test('setzona menyimpan zona valid dan menolak zona palsu', async () => {
  const f = fixture({ jid: 'zona@g.us' })
  await panggil(f.m, 'setzona', ['Asia/Makassar'])
  assert.equal(global.db.data.chats['zona@g.us'].timezone, 'Asia/Makassar')
  await panggil(f.m, 'setzona', ['Bukan/Zona'])
  assert.equal(global.db.data.chats['zona@g.us'].timezone, 'Asia/Makassar')
  assert.match(f.balasan[f.balasan.length - 1], /zona tidak dikenal/i)
})

test('.jadwal menampilkan kedua jadwal + zona', async () => {
  const f = fixture({ jid: 'lihat@g.us' })
  global.db.data.chats['lihat@g.us'] = { openTime: '07:00', closeTime: '23:00', timezone: 'Asia/Jayapura' }
  await panggil(f.m, 'jadwal')
  const teks = f.balasan[f.balasan.length - 1]
  assert.match(teks, /07:00/)
  assert.match(teks, /23:00/)
  assert.match(teks, /Asia\/Jayapura/)
})

test('tutupgc menutup grup, bukagc membuka lagi', async () => {
  const f = fixture({ jid: 'gcgc@g.us' })
  await panggil(f.m, 'tutupgc', [], { isAdmin: true })
  assert.deepEqual(f.update.at(-1), ['gcgc@g.us', 'announcement'])
  await panggil(f.m, 'bukagc', [], { isAdmin: true })
  assert.deepEqual(f.update.at(-1), ['gcgc@g.us', 'not_announcement'])
})

test('tutupgc <menit> memasang pembuka otomatis', async () => {
  const f = fixture({ jid: 'timer@g.us' })
  await panggil(f.m, 'tutupgc', ['1'], { isAdmin: true })
  assert.deepEqual(f.update.at(-1), ['timer@g.us', 'announcement'])
  assert.ok(global.umiJadwalTimer['timer@g.us'], 'timer pembuka otomatis harus ada')
  assert.match(f.balasan[f.balasan.length - 1], /1 menit/)
  // bereskan supaya proses test tidak menunggu
  clearTimeout(global.umiJadwalTimer['timer@g.us'])
  delete global.umiJadwalTimer['timer@g.us']
})

test('penjadwal menutup grup sekali saja saat jamnya tiba', async () => {
  const f = fixture({ jid: 'auto@g.us' })
  const sekarang = waktuDi('Asia/Jakarta')
  global.db.data.chats['auto@g.us'] = { closeTime: sekarang }
  const laporan1 = await jalankanJadwal()
  assert.equal(laporan1.filter((x) => x.jid === 'auto@g.us').length, 1)
  assert.deepEqual(f.update.at(-1), ['auto@g.us', 'announcement'])
  const laporan2 = await jalankanJadwal()
  assert.equal(laporan2.filter((x) => x.jid === 'auto@g.us').length, 0, 'tidak boleh dobel di menit yang sama')
})

test('penjadwal tetap jalan lewat sesi jadibot kalau bot utama gagal', async () => {
  const f = fixture({ jid: 'jadibot@g.us' })
  global.conn = { groupSettingUpdate: async () => { throw new Error('bukan member grup') }, sendMessage: async () => { } }
  const update = []
  global.jadibotConns.set('628999@s.whatsapp.net', {
    groupSettingUpdate: async (g, nilai) => { update.push([g, nilai]) },
    sendMessage: async () => { },
  })
  assert.equal(semuaSoket().length, 2)
  global.db.data.chats['jadibot@g.us'] = { openTime: waktuDi('Asia/Jakarta') }
  await jalankanJadwal()
  assert.deepEqual(update.at(-1), ['jadibot@g.us', 'not_announcement'])
})

test('setakses khusus owner, role tersimpan, dan muncul di akseslist', async () => {
  const f = fixture({ jid: 'role@g.us', users: {} })
  const target = '628222222222@s.whatsapp.net'

  await akses(f.m, { args: [target.split('@')[0], 'admin'], command: 'setakses', isOwner: false })
  assert.match(f.balasan.at(-1), /khusus owner/i)
  assert.equal(global.db.data.users[target], undefined)

  await akses(f.m, { args: [target.split('@')[0], 'admin'], command: 'setakses', isOwner: true })
  assert.equal(global.db.data.users[target].akses, 'admin')

  await akses(f.m, { args: [], command: 'akseslist', isOwner: true })
  assert.match(f.balasan.at(-1), /628222222222 — admin/)

  await akses(f.m, { args: [], command: 'myakses', sender: target })
  await akses({ ...f.m, sender: target }, { args: [], command: 'myakses' })
  assert.match(f.balasan.at(-1), /admin/)

  await akses(f.m, { args: [target.split('@')[0]], command: 'delakses', isOwner: true })
  assert.equal(global.db.data.users[target].akses, undefined)
})

test('bentuk pendek .setakses admin dengan reply memakai pengirim yang dikutip', async () => {
  const f = fixture({ jid: 'role2@g.us', users: {} })
  const target = '628333333333@s.whatsapp.net'
  const mReply = { ...f.m, quoted: { sender: target } }
  await akses(mReply, { args: ['admin'], command: 'setakses', isOwner: true })
  assert.equal(global.db.data.users[target].akses, 'admin')
})

test('role admin di database boleh memakai perintah jadwal walau bukan admin grup', async () => {
  const nomor = '628444444444@s.whatsapp.net'
  const f = fixture({ jid: 'gate@g.us', sender: nomor, users: { [nomor]: { akses: 'admin' } } })
  await panggil(f.m, 'settime', ['buka', '06:15'], { isAdmin: false, isOwner: false })
  assert.equal(global.db.data.chats['gate@g.us'].openTime, '06:15')

  const biasa = '628555555555@s.whatsapp.net'
  const g = fixture({ jid: 'gate2@g.us', sender: biasa, users: {} })
  await panggil(g.m, 'tutupgc', [], { isAdmin: false, isOwner: false })
  assert.match(g.balasan.at(-1), /khusus admin grup atau owner bot/i)
  assert.equal(g.update.length, 0)
})
