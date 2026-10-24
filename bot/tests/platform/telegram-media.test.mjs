import test from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import { freshDb, env, mockTelegram, applyTestEnv, tempDir, TEST_API_SECRET } from './helpers.mjs'
import { TelegramAdapter } from '../../lib/platform/telegram/poller.js'
import * as bots from '../../lib/platform/telegram/bots.js'
import { handlePlatformApi } from '../../lib/platform/api.js'

applyTestEnv()

const TOKEN = '123456:mock-token-abcdefghijklmnop'
const PNG = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(48, 3)])

function withPhotoServer(tg) {
  // Mock download endpoint mengembalikan PNG nyata agar validasi magic bytes diuji.
  const original = tg.state
  return original
}

test('foto dari Telegram diunggah dan tautannya benar-benar bisa diunduh', async () => {
  await freshDb()
  process.env.PLATFORM_MEDIA_DIR = tempDir('umi-media-tg-')
  const tg = await mockTelegram({ token: TOKEN })
  // Ganti endpoint file: kembalikan byte PNG.
  const rawServer = tg.base
  const e = env({ TELEGRAM_API_BASE: rawServer, PLATFORM_PUBLIC_BASE_URL: '' })

  const record = await bots.saveBot({ token: TOKEN, label: 'Media bot', ownerUserId: 'system', scope: 'platform', enabled: true, env: e })
  const adapter = new TelegramAdapter({ botRowId: record.id, env: e, logger: { log() {}, warn() {}, error() {} } })

  // Server HTTP platform untuk mengakses URL bertanda tangan.
  const platformServer = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost')
    handlePlatformApi(req, res, url.pathname, url.searchParams, e).catch(error => { res.statusCode = 500; res.end(error.message) })
  })
  await new Promise(resolve => platformServer.listen(0, '127.0.0.1', resolve))
  const platformBase = `http://127.0.0.1:${platformServer.address().port}`
  adapter.baseUrl = platformBase

  try {
    adapter.prepare()
    await adapter.init()
    // Patch unduhan berkas agar memakai PNG; kontrak client tetap sama.
    adapter.client.downloadFile = async () => ({ buffer: PNG, filePath: 'documents/foto.png' })

    const update = {
      update_id: 1,
      message: {
        message_id: 2,
        date: Math.floor(Date.now() / 1000),
        chat: { id: 900900, type: 'private' },
        from: { id: 900900, is_bot: false, first_name: 'Umi', username: 'umi' },
        photo: [{ file_id: 'small', width: 100, height: 100 }, { file_id: 'big', width: 800, height: 600 }],
      },
    }
    await adapter.processUpdate(update)
    const reply = tg.state.sent.at(-1)
    assert.ok(reply, 'bot membalas pesan media')
    assert.match(reply.text, /Upload berhasil/)
    assert.match(reply.text, /image\/png/)
    const urlMatch = reply.text.match(/http:\/\/127\.0\.0\.1:\d+\/api\/platform-system\/media\/[a-f0-9]{24}\?[^\s<"]+/)
    assert.ok(urlMatch, 'tautan bertanda tangan ada di balasan')

    const download = await fetch(urlMatch[0].replace(/&amp;/g, '&'))
    assert.equal(download.status, 200)
    assert.equal(download.headers.get('content-type'), 'image/png')
    const bytes = Buffer.from(await download.arrayBuffer())
    assert.equal(bytes.length, PNG.length)
    assert.equal(bytes.slice(0, 8).toString('hex'), PNG.slice(0, 8).toString('hex'))

    // Tanpa tanda tangan → ditolak.
    const bare = urlMatch[0].split('?')[0]
    const denied = await fetch(bare)
    assert.equal(denied.status, 403)

    // Media milik pengguna lain tidak bisa dihapus lewat API.
    const mediaId = urlMatch[0].match(/media\/([a-f0-9]{24})/)[1]
    const { platformDb } = await import('../../lib/platform/db.js')
    const ownerId = platformDb().prepare('SELECT user_id FROM platform_media WHERE id = ?').get(mediaId).user_id
    const delOther = await fetch(`${platformBase}/api/platform-system/media/${mediaId}`, {
      method: 'DELETE',
      headers: { 'x-platform-secret': TEST_API_SECRET, 'x-platform-user-id': 'web:pengguna-lain' },
    })
    assert.equal(delOther.status, 403, 'pengguna lain tidak boleh menghapus')
    const del = await fetch(`${platformBase}/api/platform-system/media/${mediaId}`, {
      method: 'DELETE',
      headers: { 'x-platform-secret': TEST_API_SECRET, 'x-platform-user-id': ownerId },
    })
    assert.equal(del.status, 200)
    const gone = await fetch(urlMatch[0].replace(/&amp;/g, '&'))
    assert.equal(gone.status, 404)
  } finally {
    await new Promise(resolve => platformServer.close(resolve))
    await tg.close()
    withPhotoServer(tg)
  }
})
