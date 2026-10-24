/* Tes batch 8: menu ringkas — keluarga fitur, opsi berdeskripsi, varian disembunyikan. */
import test from 'node:test'
import assert from 'node:assert/strict'
import { freshDb, applyTestEnv } from './helpers.mjs'
import { buildCatalog, functions, findFunction, resetCatalogCache } from '../../lib/platform/telegram/catalog.js'
import { FEATURE_GROUPS, HIDDEN_CATEGORIES, HIDDEN_COMMANDS } from '../../lib/platform/telegram/features.js'
import { registerCommands, sendFunction } from '../../lib/platform/telegram/commands.js'
import { CommandRouter } from '../../lib/platform/telegram/router.js'

// Bentuk plugin di repo ini: modul mengekspor fungsi handler dengan properti
// `command`/`description` menempel padanya.
function plugin(command, description = '') {
  const handler = async () => {}
  handler.command = Array.isArray(command) ? command : [command]
  if (description) handler.description = description
  return handler
}

function seed(plugins) {
  globalThis.plugins = plugins
  resetCatalogCache()
  return plugins
}

function fakeCtx(extra = {}) {
  const sent = []
  const edited = []
  return {
    sent,
    edited,
    ctx: {
      userId: 'web:owner', platform: 'telegram', platformUserId: '100000001', chatId: 42,
      role: 'owner', username: 'owner', displayName: 'Owner', messageId: 1, chatType: 'private',
      env: process.env, client: {},
      send: async (text, options) => { sent.push({ text: String(text), options }); return { message_id: 100 } },
      edit: async (messageId, text, options) => { edited.push({ messageId, text: String(text), options }); return { message_id: messageId } },
      answerCallback: async () => ({}),
      sendChatAction: async () => ({}),
      deleteMessage: async () => true,
      refreshIdentity() {},
      ...extra,
    },
  }
}

test('katalog: varian brat (bratvid2, bratanya) disembunyikan tapi tetap bisa dipanggil', async () => {
  seed({
    'maker/brat.js': plugin('brat'),
    'maker/brat2.js': plugin(['bratvid2', 'brat2']),
    'sticker/sticker-usanagibrat.js': plugin(['bratanya', 'usanagi']),
  })
  const built = buildCatalog(globalThis.plugins)
  assert.ok(built.byCommand.get('brat'), '/brat harus ada')
  // Menu hanya memuat yang utama…
  const menuNames = built.items.map(item => item.command)
  assert.ok(menuNames.includes('brat'))
  for (const hidden of ['bratvid2', 'brat2', 'bratanya']) {
    assert.equal(menuNames.includes(hidden), false, `${hidden} tidak boleh di menu`)
    // …tetapi perintahnya masih bisa diketik (tidak ada fitur yang dimatikan).
    assert.ok(built.byCommand.get(hidden), `${hidden} harus tetap terdaftar`)
    assert.equal(built.byCommand.get(hidden).hidden, true)
  }
  assert.ok(HIDDEN_COMMANDS.has('bratvid2'))
})

test('katalog: folder umi-extra & pelengkap tidak masuk menu', async () => {
  seed({
    'umi-extra/fun-benarkah.js': plugin('benarkah'),
    'pelengkap/umi/tools/umi-tebalteks.js': plugin('tebalteks'),
    'fun/usanagi-fun.js': plugin('funbiasa'),
    'data/datax.js': plugin('datax'),
  })
  const built = buildCatalog(globalThis.plugins)
  assert.ok(built.byCommand.get('funbiasa'))
  const menuNames = built.items.map(item => item.command)
  for (const hidden of ['benarkah', 'tebalteks', 'datax']) {
    assert.equal(menuNames.includes(hidden), false, `${hidden} tidak boleh tampil di menu`)
    assert.ok(built.byCommand.get(hidden), `${hidden} tetap bisa dipanggil`)
  }
  for (const id of ['umi-extra', 'pelengkap', 'data']) {
    assert.ok(HIDDEN_CATEGORIES.has(id))
    assert.equal(built.byCategory.has(id), false, `kategori ${id} tidak boleh muncul`)
  }
})

test('fungsi ringkas: satu grup brat berisi opsi + deskripsi masing-masing', async () => {
  seed({
    'maker/brat.js': plugin('brat'),
    'maker/bratvid.js': plugin('bratvid'),
    'maker/maker-cewekbrat.js': plugin('cewekbrat'),
  })
  const group = findFunction('brat')
  assert.ok(group, 'grup brat harus ada')
  assert.deepEqual(group.options.map(o => o.command), ['brat', 'bratvid', 'cewekbrat'])
  for (const option of group.options) assert.ok(option.description.length > 5, `${option.command} butuh deskripsi`)
  assert.match(group.options[0].description, /hitam-putih/i)
})

test('fungsi ringkas: opsi yang perintahnya tidak termuat tidak ditampilkan', async () => {
  seed({ 'maker/brat.js': plugin('brat') })
  const group = findFunction('brat')
  assert.equal(group.options.length, 1)
  assert.equal(group.options[0].command, 'brat')
})

test('fungsi ringkas: satu perintah tidak muncul di dua grup', async () => {
  seed({
    'downloader/down-spdl.js': plugin(['spotify', 'spotdl']),
    'music/play.js': plugin('play'),
  })
  const all = functions().flatMap(group => group.options.map(option => option.command))
  assert.equal(all.filter(name => name === 'spotify').length, 1)
})

test('fungsi ringkas: urutan grup mengikuti FEATURE_GROUPS', async () => {
  seed({
    'maker/brat.js': plugin('brat'),
    'downloader/ytmp4.js': plugin('ytmp4'),
    'ai/ai-gemini.js': plugin('gemini'),
  })
  const ids = functions().map(group => group.id)
  const expected = FEATURE_GROUPS.map(group => group.id).filter(id => ids.includes(id))
  assert.deepEqual(ids, expected)
})

test('sendFunction: menampilkan opsi bernomor + deskripsi + tombol per opsi', async () => {
  await freshDb()
  applyTestEnv()
  seed({
    'maker/brat.js': plugin('brat'),
    'maker/bratvid.js': plugin('bratvid'),
    'maker/maker-cewekbrat.js': plugin('cewekbrat'),
  })
  const { ctx, sent } = fakeCtx()
  await sendFunction(ctx, 'brat', 1)
  const text = sent[0].text
  assert.match(text, /STIKER TULISAN/i)
  assert.match(text, /1\.<\/b> <code>\/brat/)
  assert.match(text, /2\.<\/b> <code>\/bratvid/)
  assert.match(text, /Stiker teks versi bergerak/)
  const buttons = sent[0].options.reply_markup.inline_keyboard.flat().map(button => button.text)
  assert.ok(buttons.includes('/brat'))
  assert.ok(buttons.includes('/bratvid'))
})

test('sendFunction: saat tombol ditekan (callbackMessageId) pesan yang sama diedit', async () => {
  await freshDb()
  applyTestEnv()
  seed({ 'maker/brat.js': plugin('brat'), 'maker/bratvid.js': plugin('bratvid') })
  const { ctx, sent, edited } = fakeCtx({ callbackMessageId: 777 })
  await sendFunction(ctx, 'brat', 1)
  assert.equal(edited.length, 1)
  assert.equal(edited[0].messageId, 777)
  assert.equal(sent.length, 0)
})

test('sendFunction: id fitur tidak dikenal dijawab jelas', async () => {
  await freshDb()
  applyTestEnv()
  seed({ 'maker/brat.js': plugin('brat') })
  const { ctx, sent } = fakeCtx()
  await sendFunction(ctx, 'tidakada', 1)
  assert.match(sent[0].text, /tidak tersedia/i)
})

test('menu memuat tombol fitur ringkas (fn:<id>)', async () => {
  await freshDb()
  applyTestEnv()
  seed({
    'maker/brat.js': plugin('brat'),
    'maker/bratvid.js': plugin('bratvid'),
    'downloader/ytmp4.js': plugin('ytmp4'),
    'ai/ai-gemini.js': plugin('gemini'),
  })
  const router = new CommandRouter({ logger: { error() {}, warn() {}, info() {} } })
  registerCommands(router, { logger: { error() {}, warn() {}, info() {} } })
  const { ctx, sent } = fakeCtx()
  await router.commands.get('menu').handler(ctx, { name: 'menu', args: [], text: '' }, null)
  const keyboards = sent.map(entry => JSON.stringify(entry.options?.reply_markup || {})).join(' ')
  assert.match(keyboards, /Stiker tulisan/i, 'tombol fitur harus muncul di menu')
  assert.match(keyboards, /Unduh video/i)
})
