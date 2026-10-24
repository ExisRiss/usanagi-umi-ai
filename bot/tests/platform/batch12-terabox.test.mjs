/* Tes batch 12: /terabox memakai API resmi TeraBox (bukan situs mati) + cookie akun. */
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {
  parseTeraBoxUrl, resolveTeraBoxShare, teraboxDirectLink,
  teraboxCookie, persistTeraboxCookie, clearTeraboxCookie, teraboxStatus,
  resetTeraboxConfigCache, TERABOX_NOT_CONFIGURED,
} from '../../lib/terabox.js'
import handler from '../../plugins/downloader/downloader-terabox.js'
import cookieHandler from '../../plugins/owner/umi-tbcookie.js'

const SURl = 'cnTOBQQK3n5Tj78UwxhrRw'
const OK_COOKIE = 'ndus=abcdef1234567890abcdef; lang=en'

function stubFetch(handlerFn) {
  const original = globalThis.fetch
  const calls = []
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), options })
    const body = handlerFn(String(url), options)
    if (body instanceof Response) return body
    const text = typeof body === 'string' ? body : JSON.stringify(body)
    return new Response(text, { status: 200, headers: { 'content-type': 'application/json' } })
  }
  return { calls, restore: () => { globalThis.fetch = original } }
}

const rootInfo = {
  errno: 0,
  title: '/FOLDER/Umi',
  shareid: 389864969466,
  uk: '81367744545506',
  sign: 'abc123sign',
  timestamp: 1792481629,
  list: [{ server_filename: 'Umi', isdir: '1', path: '/Umi', size: '0', fs_id: '1' }],
}
const folderList = {
  errno: 0,
  list: [
    { server_filename: 'kecil.mp4', isdir: '0', path: '/Umi/kecil.mp4', size: '2048', fs_id: '11' },
    { server_filename: 'besar.mkv', isdir: '0', path: '/Umi/besar.mkv', size: String(600 * 1024 * 1024), fs_id: '12' },
  ],
}

function envFile() {
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'umi-tb-')), '.env.terabox')
  process.env.UMI_TERABOX_ENV_FILE = file
  delete process.env.TERABOX_COOKIE
  resetTeraboxConfigCache()
  return file
}

/* ───────────── parsing ───────────── */

test('parse: semua bentuk link TeraBox dinormalkan ke surl berawalan 1', () => {
  const cases = [
    `https://www.terabox.app/wap/share/filelist?surl=${SURl}`,
    `https://terabox.com/sharing/link?surl=${SURl}`,
    `https://1024terabox.com/s/${SURl}`,
    `https://www.terabox.app/s/1${SURl}`,
    SURl,
  ]
  for (const link of cases) {
    const parsed = parseTeraBoxUrl(link)
    assert.equal(parsed.apiSurl, `1${SURl}`, `gagal untuk ${link}`)
    assert.equal(parsed.plainSurl, SURl)
  }
})

test('parse: link yang sudah berawalan 1 tidak ditambah lagi', () => {
  const parsed = parseTeraBoxUrl('https://terabox.com/s/1hTspAuZCdy5vDAPiUOn3ig')
  assert.equal(parsed.apiSurl, '1hTspAuZCdy5vDAPiUOn3ig')
  assert.equal(parsed.plainSurl, 'hTspAuZCdy5vDAPiUOn3ig')
})

test('parse: sampah ditolak dengan pesan jelas', () => {
  assert.throws(() => parseTeraBoxUrl(''), /kosong/i)
  assert.throws(() => parseTeraBoxUrl('halo dunia'), /tidak dikenali/i)
})

/* ───────────── pembacaan share ───────────── */

test('resolve: shorturl wajib berawalan 1 dan isi folder ditelusuri', async () => {
  envFile()
  const stub = stubFetch((url) => {
    if (url.includes('/sharing/link')) return '<html></html>'
    if (url.includes('/api/shorturlinfo')) {
      assert.match(url, /shorturl=1cnTOBQQK3n5Tj78UwxhrRw/)
      return rootInfo
    }
    if (url.includes('/share/list')) {
      assert.match(url, /dir=%2FUmi/)
      assert.match(url, /sign=abc123sign/)
      return folderList
    }
    return { errno: 1 }
  })
  try {
    const share = await resolveTeraBoxShare(`https://www.terabox.app/s/${SURl}`, { timeoutMs: 3000 })
    assert.equal(share.title, '/FOLDER/Umi')
    assert.equal(share.files.length, 2)
    assert.equal(share.files[0].name, 'kecil.mp4')
    assert.equal(share.totalSize, 2048 + 600 * 1024 * 1024)
    assert.equal(share.folders.length, 1)
  } finally { stub.restore() }
})

test('resolve: mirror pertama gagal → pindah mirror berikutnya', async () => {
  envFile()
  let seen = 0
  const stub = stubFetch((url) => {
    if (url.includes('/sharing/link')) return '<html></html>'
    if (url.includes('shorturlinfo')) {
      seen += 1
      return seen === 1 ? { errno: 400210, errmsg: 'need verify_v2' } : rootInfo
    }
    if (url.includes('/share/list')) return folderList
    return { errno: 1 }
  })
  try {
    const share = await resolveTeraBoxShare(`https://www.terabox.app/s/${SURl}`, { timeoutMs: 3000 })
    assert.equal(share.files.length, 2)
    assert.ok(seen >= 2, 'harus mencoba mirror kedua')
  } finally { stub.restore() }
})

test('resolve: link mati (errno 105) disebut jelas', async () => {
  envFile()
  const stub = stubFetch(() => ({ errno: 105 }))
  try {
    await assert.rejects(
      () => resolveTeraBoxShare('https://terabox.com/s/1aaaaaa', { timeoutMs: 1000, mirrors: ['https://www.terabox.app'] }),
      (error) => {
        assert.match(error.message, /tidak valid|kedaluwarsa/i)
        return true
      },
    )
  } finally { stub.restore() }
})

/* ───────────── link unduhan ───────────── */

const shareFixture = {
  host: 'https://www.terabox.app', surl: SURl, shareId: 1, uk: '2', sign: 'sig', timestamp: 3,
  referer: 'https://www.terabox.app/sharing/link?surl=x',
}

test('dlink: tanpa cookie → kode TERABOX_NOT_CONFIGURED (bukan error acak)', async () => {
  envFile()
  await assert.rejects(
    () => teraboxDirectLink(shareFixture, { fsId: '11' }),
    (error) => error.code === TERABOX_NOT_CONFIGURED,
  )
})

test('dlink: dengan cookie mengirim header Cookie dan mengembalikan dlink', async () => {
  const file = envFile()
  persistTeraboxCookie(OK_COOKIE)
  const stub = stubFetch((url) => {
    assert.match(url, /fid_list=%5B11%5D/)
    return { errno: 0, dlink: [{ fs_id: '11', dlink: 'https://d.terabox.com/file/abc' }] }
  })
  try {
    const direct = await teraboxDirectLink(shareFixture, { fsId: '11' })
    assert.equal(direct, 'https://d.terabox.com/file/abc')
    assert.match(stub.calls[0].options.headers.Cookie, /ndus=abcdef/)
    assert.equal(fs.existsSync(file), true)
  } finally { stub.restore() }
})

test('dlink: cookie kedaluwarsa (400310) → pesan minta perbarui', async () => {
  envFile()
  persistTeraboxCookie(OK_COOKIE)
  const stub = stubFetch(() => ({ errno: 400310, errmsg: 'need verify_v2' }))
  try {
    await assert.rejects(
      () => teraboxDirectLink(shareFixture, { fsId: '11' }),
      (error) => /tidak berlaku lagi/i.test(error.message) && error.code === TERABOX_NOT_CONFIGURED,
    )
  } finally { stub.restore() }
})

test('cookie: disimpan mode 600, status tidak membocorkan isi', () => {
  const file = envFile()
  persistTeraboxCookie(OK_COOKIE)
  assert.equal(fs.statSync(file).mode & 0o777, 0o600)
  assert.equal(teraboxCookie(), OK_COOKIE)
  const status = teraboxStatus()
  assert.equal(status.configured, true)
  assert.equal(status.accountCookie, true)
  assert.equal(JSON.stringify(status).includes('abcdef1234567890'), false)
  clearTeraboxCookie()
  assert.equal(teraboxStatus().configured, false)
})

/* ───────────── perintah /terabox ───────────── */

function botHarness({ text, telegram = true } = {}) {
  const replies = []
  const sent = []
  const m = {
    chat: telegram ? '999123@s.whatsapp.net' : '628111@s.whatsapp.net',
    sender: telegram ? '999123@s.whatsapp.net' : '628111@s.whatsapp.net',
    isGroup: false,
    __telegram: telegram,
    text: `/terabox ${text}`,
    key: { id: 'x' },
    reply: async (body) => { replies.push(String(body)); return body },
    delete: async () => {},
  }
  const conn = { sendMessage: async (chat, content) => { sent.push(content); return {} } }
  return { m, conn, replies, sent }
}

test('perintah: tanpa argumen menampilkan contoh pemakaian', async () => {
  const ctx = botHarness({ text: '' })
  await handler(ctx.m, { conn: ctx.conn, text: '', usedPrefix: '/', command: 'terabox' })
  assert.match(ctx.replies.at(-1), /terabox https:\/\//i)
})

test('perintah: tanpa cookie → daftar file nyata + penjelasan butuh akun', async () => {
  envFile()
  const stub = stubFetch((url) => {
    if (url.includes('/sharing/link')) return '<html></html>'
    if (url.includes('shorturlinfo')) return rootInfo
    if (url.includes('/share/list')) return folderList
    return { errno: 1 }
  })
  try {
    const ctx = botHarness({ text: `https://www.terabox.app/wap/share/filelist?surl=${SURl}` })
    await handler(ctx.m, { conn: ctx.conn, text: `https://www.terabox.app/wap/share/filelist?surl=${SURl}`, usedPrefix: '/', command: 'terabox' })
    const last = ctx.replies.at(-1)
    assert.match(last, /kecil\.mp4/)
    assert.match(last, /2\.0 KB/)
    assert.match(last, /butuh akun/i)
    assert.match(last, /tbcookie set/)
    assert.equal(ctx.sent.length, 0)
  } finally { stub.restore() }
})

test('perintah: dengan cookie mengirim file kecil, menolak file terlalu besar', async () => {
  envFile()
  persistTeraboxCookie(OK_COOKIE)
  const stub = stubFetch((url) => {
    if (url.includes('/sharing/link')) return '<html></html>'
    if (url.includes('shorturlinfo')) return rootInfo
    if (url.includes('/share/list')) return folderList
    if (url.includes('/share/download')) {
      if (url.includes('fid_list=%5B11%5D')) return { errno: 0, dlink: [{ dlink: 'https://d.terabox.com/kecil.mp4' }] }
      return { errno: 0, dlink: [{ dlink: 'https://d.terabox.com/besar.mkv' }] }
    }
    return { errno: 1 }
  })
  try {
    const ctx = botHarness({ text: `https://www.terabox.app/s/${SURl}` })
    await handler(ctx.m, { conn: ctx.conn, text: `https://www.terabox.app/s/${SURl}`, usedPrefix: '/', command: 'terabox' })
    assert.equal(ctx.sent.length, 1, 'hanya file kecil yang dikirim')
    assert.match(JSON.stringify(ctx.sent[0]), /kecil\.mp4/)
    const last = ctx.replies.at(-1)
    assert.match(last, /Terkirim 1 file/)
    assert.match(last, /terlalu besar/i)
  } finally { stub.restore() }
})

test('perintah: nomor file di luar jangkauan dijawab jelas', async () => {
  envFile()
  persistTeraboxCookie(OK_COOKIE)
  const stub = stubFetch((url) => {
    if (url.includes('/sharing/link')) return '<html></html>'
    if (url.includes('shorturlinfo')) return rootInfo
    if (url.includes('/share/list')) return folderList
    return { errno: 1 }
  })
  try {
    const ctx = botHarness({ text: `https://www.terabox.app/s/${SURl} 9` })
    await handler(ctx.m, { conn: ctx.conn, text: `https://www.terabox.app/s/${SURl} 9`, usedPrefix: '/', command: 'terabox' })
    assert.match(ctx.replies.at(-1), /tidak ada/i)
  } finally { stub.restore() }
})

/* ───────────── /tbcookie (owner) ───────────── */

test('tbcookie: set di grup ditolak, di DM tersimpan dan disamarkan', async () => {
  envFile()
  global.owner = [['100000001', 'Owner', true]]
  const groupReplies = []
  const groupMessage = { chat: '1@g.us', sender: '100000001@s.whatsapp.net', isGroup: true, reply: async (body) => groupReplies.push(String(body)) }
  await cookieHandler(groupMessage, { usedPrefix: '/', text: `set ${OK_COOKIE}` })
  assert.match(groupReplies.at(-1), /Jangan kirim cookie di grup/)

  const dmReplies = []
  const dmMessage = { chat: '100000001@s.whatsapp.net', sender: '100000001@s.whatsapp.net', isGroup: false, reply: async (body) => dmReplies.push(String(body)), delete: async () => {} }
  await cookieHandler(dmMessage, { usedPrefix: '/', text: `set ${OK_COOKIE}` })
  const reply = dmReplies.at(-1)
  assert.match(reply, /Cookie TeraBox tersimpan/)
  assert.equal(reply.includes('abcdef1234567890'), false, 'cookie tidak boleh dipantulkan utuh')
  assert.equal(teraboxCookie(), OK_COOKIE)
})

test('tbcookie: bukan owner ditolak', async () => {
  envFile()
  global.owner = [['100000001', 'Owner', true]]
  const replies = []
  const message = { chat: '628999@s.whatsapp.net', sender: '628999@s.whatsapp.net', isGroup: false, reply: async (body) => replies.push(String(body)) }
  await cookieHandler(message, { usedPrefix: '/', text: 'status' })
  assert.match(replies.at(-1), /khusus owner/i)
})
