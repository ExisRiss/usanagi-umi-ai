import test from 'node:test'
import assert from 'node:assert/strict'
import { Readable } from 'node:stream'
import { freshDb, applyTestEnv, env, TEST_API_SECRET } from './helpers.mjs'
import { handlePlatformApi } from '../../lib/platform/api.js'
import {
  applyPremiumPatch,
  entryMatchesFeature,
  getPremiumSystem,
  isPremiumFeatureLocked,
  normalizePremiumEntries,
  premiumRuleMatches,
  searchFeatures,
  setPremiumSystem,
} from '../../lib/premium-mode.js'
import { normalizePremiumConfig } from '../../lib/bot-config.js'

applyTestEnv()

const FEATURE = {
  key: 'maker/stiker.js',
  basename: 'stiker.js',
  name: 'stiker',
  command: 'sticker',
  tags: ['maker', 'sticker'],
}

test('entri premium dinormalkan: huruf kecil, tanpa prefix, unik, maksimum 300', () => {
  assert.deepEqual(
    normalizePremiumEntries(['Sticker', '#brat', '.sticker', '  ', 'tag:AI']),
    ['sticker', 'brat', 'tag:ai'],
  )
  const many = Array.from({ length: 400 }, (_, index) => `fitur-${index}`)
  assert.equal(normalizePremiumEntries(many).length, 300)
})

test('normalizePremiumConfig di bot-config menyimpan saklar dan daftar', () => {
  assert.deepEqual(normalizePremiumConfig({ enabled: false, plugins: ['Sticker', 'sticker', 'Brat'] }), {
    enabled: false,
    plugins: ['sticker', 'brat'],
  })
  // Default menyala supaya perilaku bot lama tidak berubah.
  assert.deepEqual(normalizePremiumConfig(undefined), { enabled: true, plugins: [] })
})

test('aturan premium cocok untuk command, plugin path, tag, dan nama', () => {
  assert.equal(premiumRuleMatches('sticker', FEATURE), true)
  assert.equal(premiumRuleMatches('command:sticker', FEATURE), true)
  assert.equal(premiumRuleMatches('command:menu', FEATURE), false)
  assert.equal(premiumRuleMatches('plugin:maker/stiker.js', FEATURE), true)
  assert.equal(premiumRuleMatches('plugin:stiker', FEATURE), true)
  assert.equal(premiumRuleMatches('tag:maker', FEATURE), true)
  assert.equal(premiumRuleMatches('kategori:maker', FEATURE), true)
  assert.equal(premiumRuleMatches('stiker', { ...FEATURE, command: '' }), true)
  assert.equal(premiumRuleMatches('tidak-ada', FEATURE), false)
})

test('validasi input memakai katalog: command valid, tag valid, typo tidak valid', () => {
  const catalogEntry = { key: 'maker/stiker.js', basename: 'stiker.js', name: 'stiker', commands: ['sticker', 'stiker'], tags: ['maker'] }
  assert.equal(entryMatchesFeature('sticker', catalogEntry), true)
  assert.equal(entryMatchesFeature('.sticker', catalogEntry), true)
  assert.equal(entryMatchesFeature('command:stiker', catalogEntry), true)
  assert.equal(entryMatchesFeature('plugin:maker/stiker.js', catalogEntry), true)
  assert.equal(entryMatchesFeature('tag:maker', catalogEntry), true)
  assert.equal(entryMatchesFeature('stikerr', catalogEntry), false)
})

test('gating: saklar platform dan saklar bot harus sama-sama ON', async () => {
  await freshDb()
  const profile = {
    type: 'jadibot',
    number: '628111222333',
    premium: { enabled: true, plugins: ['sticker', 'tag:ai'] },
  }

  setPremiumSystem(true, 'test')
  assert.equal(getPremiumSystem().enabled, true)
  assert.equal(isPremiumFeatureLocked(profile, FEATURE), true, 'fitur di daftar dikunci')
  assert.equal(isPremiumFeatureLocked(profile, { ...FEATURE, command: 'menu', tags: ['main'] }), false, 'fitur lain bebas')
  assert.equal(isPremiumFeatureLocked(profile, { ...FEATURE, command: 'menu', tags: ['ai'] }), true, 'tag ikut mengunci')
  assert.equal(isPremiumFeatureLocked(profile, FEATURE, { builtinPremium: true }), true, 'plugin premium bawaan ikut dikunci')

  profile.premium.enabled = false
  assert.equal(isPremiumFeatureLocked(profile, FEATURE), false, 'bot OFF = semua gratis')
  assert.equal(isPremiumFeatureLocked(profile, FEATURE, { builtinPremium: true }), false, 'bot OFF juga membebaskan plugin bawaan')

  profile.premium.enabled = true
  setPremiumSystem(false, 'test')
  assert.equal(isPremiumFeatureLocked(profile, FEATURE), false, 'platform OFF = semua gratis')
  assert.equal(isPremiumFeatureLocked(profile, FEATURE, { builtinPremium: true }), false)
  setPremiumSystem(true, 'test')
})

test('applyPremiumPatch menulis via saveJadibotConfig tanpa menyentuh bot lain', () => {
  const profile = { type: 'jadibot', number: '628111222333', premium: { enabled: true, plugins: ['sticker'] } }
  let saved = null
  const result = applyPremiumPatch(profile, { plugins: ['sticker', 'brat'] }, target => { saved = target })
  assert.deepEqual(result, { enabled: true, plugins: ['sticker', 'brat'] })
  assert.equal(saved, profile)
  assert.deepEqual(profile.premium, { enabled: true, plugins: ['sticker', 'brat'] })
  assert.equal(applyPremiumPatch(profile, { enabled: false }, target => { saved = target }).enabled, false)
})

/* ---------------------------------------------------------------- API */

function makeReq({ method = 'GET', headers = {}, body = null } = {}) {
  const chunks = body === null ? [] : [Buffer.from(JSON.stringify(body))]
  const req = Readable.from(chunks)
  req.method = method
  req.headers = headers
  return req
}

function makeRes() {
  return {
    statusCode: 0,
    headers: {},
    chunks: [],
    writableEnded: false,
    writeHead(status, headers = {}) { this.statusCode = status; this.headers = headers; return this },
    end(chunk) { if (chunk) this.chunks.push(Buffer.from(chunk)); this.writableEnded = true },
    write(chunk) { if (chunk) this.chunks.push(Buffer.from(chunk)) },
    get body() { return Buffer.concat(this.chunks) },
    get json() { return JSON.parse(this.body.toString('utf8')) },
  }
}

async function call(path, { method = 'GET', body = null, user = null, auth = true, headers = {} } = {}) {
  const res = makeRes()
  const req = makeReq({
    method,
    headers: {
      accept: 'application/json',
      ...(auth ? { 'x-platform-secret': TEST_API_SECRET } : {}),
      ...(user ? { 'x-platform-user-id': user } : {}),
      ...headers,
    },
    body,
  })
  const url = new URL(`http://localhost${path}`)
  await handlePlatformApi(req, res, url.pathname, url.searchParams, env())
  return res
}

async function bootstrapUser(authId, role) {
  const res = await call('/api/platform-system/bootstrap', {
    method: 'POST',
    body: { authId, email: `${authId}@example.com`, role },
  })
  assert.equal(res.statusCode, 200, res.body.toString())
  return res.json
}

test('API /premium-mode: user biasa 403, developer & owner boleh', async () => {
  await freshDb()
  const owner = await bootstrapUser('auth-owner', 'owner')
  const dev = await bootstrapUser('auth-dev', 'developer')
  const member = await bootstrapUser('auth-user', 'user')

  const denied = await call('/api/platform-system/premium-mode', { user: member.userId })
  assert.equal(denied.statusCode, 403)

  const read = await call('/api/platform-system/premium-mode', { user: owner.userId })
  assert.equal(read.statusCode, 200)
  assert.equal(read.json.enabled, true)

  const off = await call('/api/platform-system/premium-mode', {
    method: 'POST', user: dev.userId, body: { enabled: false },
  })
  assert.equal(off.statusCode, 200)
  assert.equal(off.json.enabled, false)
  assert.equal(getPremiumSystem().enabled, false)

  const bad = await call('/api/platform-system/premium-mode', {
    method: 'POST', user: owner.userId, body: { enabled: 'nope' },
  })
  assert.equal(bad.statusCode, 400)

  const on = await call('/api/platform-system/premium-mode', {
    method: 'POST', user: owner.userId, body: { enabled: true },
  })
  assert.equal(on.statusCode, 200)
  assert.equal(on.json.enabled, true)
})

test('katalog fitur bisa dicari (dipakai website dan .premium cari)', () => {
  const plugins = {
    'maker/stiker.js': { command: /^(sticker|stiker)$/i, name: 'stiker', tags: ['maker'], premium: true },
    'ai/autogpt chat.js': { command: ['ai', 'chat'], name: 'AutoAI', tags: ['ai'] },
  }
  const found = searchFeatures('stik', 5, plugins)
  assert.equal(found.length, 1)
  assert.equal(found[0].key, 'maker/stiker.js')
  assert.deepEqual(found[0].commands.sort(), ['stiker', 'sticker'].sort())
  assert.equal(found[0].premium, true)
  assert.ok(searchFeatures('ai', 5, plugins).some(feature => feature.key === 'ai/autogpt chat.js'))
  assert.equal(searchFeatures('tidak-ada', 5, plugins).length, 0)
})
