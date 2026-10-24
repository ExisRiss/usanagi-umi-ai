/* Tes batch 11b: perintah owner /aikey (simpan, tolak grup, status, hapus). */
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { resetGeminiConfigCache } from '../../lib/gemini-client.js'
import handler from '../../plugins/owner/umi-aikey.js'

const KEY = 'AIzaSyOWNERonlykey0000000000000000000'
const AQ_KEY = 'AQ.Ab8OWNERonlykey00000000000000000000000000000'
const OWNER_ID = '100000001'

function harness({ text = '', isGroup = false } = {}) {
  const replies = []
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'umi-aikey-')), 'gemini.env')
  process.env.UMI_GEMINI_ENV_FILE = file
  process.env.GEMINI_API_KEY = ''
  delete process.env.GOOGLE_API_KEY
  resetGeminiConfigCache()
  global.owner = [[OWNER_ID, 'Owner', true]]
  const m = {
    chat: `${OWNER_ID}@s.whatsapp.net`,
    sender: `${OWNER_ID}@s.whatsapp.net`,
    isGroup,
    key: { id: 'k' },
    reply: async (body) => { replies.push(String(body)); return body },
  }
  const conn = { sendMessage: async () => ({}) }
  return { m, conn, replies, file, text }
}

const run = (ctx, { usedPrefix = '/', command = 'aikey' } = {}) =>
  handler(ctx.m, { conn: ctx.conn, usedPrefix, command, text: ctx.text })

test('aikey status: melaporkan penyedia tanpa membocorkan kunci', async () => {
  const ctx = harness({ text: 'status' })
  await run(ctx)
  const reply = ctx.replies.at(-1)
  assert.match(reply, /STATUS AUTO-AI/)
  assert.match(reply, /Gemini\s+:\s+❌/)
  assert.equal(reply.includes(KEY), false)
})

test('aikey set: menyimpan berkas 600 dan menyamarkan kunci', async () => {
  const ctx = harness({ text: `set ${KEY}` })
  await run(ctx)
  const reply = ctx.replies.at(-1)
  assert.match(reply, /Kunci Gemini tersimpan/)
  assert.equal(reply.includes(KEY), false, 'kunci tidak boleh dipantulkan utuh')
  assert.match(reply, /AIzaSy…/)
  assert.equal(fs.statSync(ctx.file).mode & 0o777, 0o600)
  assert.match(fs.readFileSync(ctx.file, 'utf8'), new RegExp(`GEMINI_API_KEY=${KEY}`))
})

test('aikey set: kunci format baru AQ. diterima', async () => {
  const ctx = harness({ text: `set ${AQ_KEY}` })
  await run(ctx)
  assert.match(ctx.replies.at(-1), /Kunci Gemini tersimpan/)
  assert.match(fs.readFileSync(ctx.file, 'utf8'), new RegExp(`GEMINI_API_KEY=${AQ_KEY.replace(/\./g, '\\.')}`))
})

test('aikey set: kunci di grup ditolak', async () => {
  const ctx = harness({ text: `set ${KEY}`, isGroup: true })
  await run(ctx)
  assert.match(ctx.replies.at(-1), /Jangan kirim kunci di grup/)
  assert.equal(fs.existsSync(ctx.file), false)
})

test('aikey set: format aneh ditolak', async () => {
  const ctx = harness({ text: 'set halo-dunia' })
  await run(ctx)
  assert.match(ctx.replies.at(-1), /Format kunci tidak dikenali/)
  assert.equal(fs.existsSync(ctx.file), false)
})

test('aikey <kunci> langsung tanpa subperintah', async () => {
  const ctx = harness({ text: KEY })
  await run(ctx)
  assert.match(ctx.replies.at(-1), /Kunci Gemini tersimpan/)
})

test('aikey: bukan owner ditolak', async () => {
  const ctx = harness({ text: 'status' })
  ctx.m.sender = '628000000000@s.whatsapp.net'
  ctx.m.chat = '628000000000@s.whatsapp.net'
  await run(ctx)
  assert.match(ctx.replies.at(-1), /khusus owner/i)
})

test('aikey hapus: berkas kunci dihapus', async () => {
  const ctx = harness({ text: `set ${KEY}` })
  await run(ctx)
  assert.equal(fs.existsSync(ctx.file), true)
  ctx.text = 'hapus'
  await run(ctx)
  assert.match(ctx.replies.at(-1), /Kunci Gemini dihapus/)
  assert.equal(fs.existsSync(ctx.file), false)
})
