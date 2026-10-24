// Task80: setting lengkap bot utama — validasi, penyimpanan 600, dan integrasi
// ke profil bot utama yang dibaca handler.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'umi-main-settings-test-'))
const oldCwd = process.cwd()
process.chdir(temp)
const file = path.join(temp, 'data', 'main-bot-settings.json')
process.env.UMI_MAIN_BOT_SETTINGS_FILE = file
const settings = await import('../lib/main-bot-settings.js')
const { getMainBotConfig, isPluginDisabled } = await import('../lib/bot-config.js')

test('tanpa berkas setting, profil bot utama tetap memakai perilaku lama', () => {
  global.mainBot = { defaultPrefix: '/' }
  const profile = getMainBotConfig()
  assert.equal(profile.defaultPrefix, '/')
  assert.equal(profile.defaultLimit, 50)
  assert.equal(profile.public, true)
  assert.equal(profile.registrationRequired, true)
  assert.equal(profile.managedSettings, false)
})

test('simpan field lain tidak mengubah prefix yang sedang aktif', async () => {
  const { saveDefaultPrefix } = await import('../core/awang-prefix-text.js')
  saveDefaultPrefix('/')
  await settings.applyMainBotSettingsInput({ multiplier: 30 }, { actor: 'test' })
  assert.equal(settings.mainBotSettingsView().prefix, '/')
  assert.equal(JSON.parse(fs.readFileSync(file, 'utf8')).prefix, '/')
})

test('setting tersimpan (mode 600) dan getMainBotConfig memakainya', async () => {
  await settings.applyMainBotSettingsInput({
    bot_name: 'Umi Test',
    prefix: '#',
    mode: 'self',
    only_group: true,
    registration_required: false,
    default_limit: 15,
    limit_enabled: false,
  }, { actor: 'test' })
  assert.equal(fs.statSync(file).mode & 0o777, 0o600)
  const profile = getMainBotConfig()
  assert.equal(profile.defaultPrefix, '#')
  assert.equal(profile.public, false)
  assert.equal(profile.onlyGroup, true)
  assert.equal(profile.registrationRequired, false)
  assert.equal(profile.defaultLimit, 15)
  assert.equal(profile.limitEnabled, false)
  assert.equal(profile.managedSettings, true)
  assert.equal(profile.values.namebot, 'Umi Test')
})

test('nomor owner divalidasi dan dipakai profil bot utama', async () => {
  await settings.applyMainBotSettingsInput({ owner_number: '+62 812-3456-7890' }, { actor: 'test' })
  assert.equal(settings.mainBotSettingsView().owner_number, '6281234567890')
  assert.deepEqual(getMainBotConfig().ownerNumbers, ['6281234567890'])
  await assert.rejects(() => settings.applyMainBotSettingsInput({ owner_number: '12345' }, {}), /8-15 digit/)
  await settings.applyMainBotSettingsInput({ owner_number: '' }, {})
  assert.deepEqual(getMainBotConfig().ownerNumbers, [])
})

test('plugin nonaktif dan Channel ID UPCH tersimpan untuk bot utama', async () => {
  await settings.applyMainBotSettingsInput({ disabled_plugins: ['Sticker/sticker.js', 'command:brat', 'plugin:tools/tts.js', 'sticker/sticker.js'] }, { actor: 'test' })
  assert.deepEqual(settings.mainBotSettingsView().disabled_plugins, ['sticker/sticker.js', 'command:brat', 'plugin:tools/tts.js'])
  const profile = getMainBotConfig()
  assert.deepEqual(profile.disabledPlugins, ['sticker/sticker.js', 'command:brat', 'plugin:tools/tts.js'])
  assert.equal(isPluginDisabled(profile, 'sticker/sticker.js'), true)
  assert.equal(isPluginDisabled(profile, 'tools/tts.js'), true)
  assert.equal(isPluginDisabled(profile, 'tools/other.js'), false)
  assert.equal(isPluginDisabled(profile, 'apa/saja.js', 'brat'), true)
  await assert.rejects(() => settings.applyMainBotSettingsInput({ disabled_plugins: 'sticker' }, {}), /array/i)
  await assert.rejects(() => settings.applyMainBotSettingsInput({ links: { channel_id: 'bukan-id' } }, {}), /Channel ID/)
  await settings.applyMainBotSettingsInput({ links: { channel_id: '120363012345678901@newsletter' } }, {})
  assert.equal(settings.mainBotSettingsView().links.channelId, '120363012345678901@newsletter')
  assert.equal(settings.mainBotSettingsView().links.websiteUrl, '')
})

test('prefix 4 karakter dan limit di luar batas ditolak', async () => {
  await assert.rejects(() => settings.applyMainBotSettingsInput({ prefix: 'abcd' }, {}), /Prefix/)
  await assert.rejects(() => settings.applyMainBotSettingsInput({ default_limit: 100001 }, {}), /Limit/)
  await assert.rejects(() => settings.applyMainBotSettingsInput({ auto_ai: 'ya' }, {}), /AutoAI/)
})

test('view tidak pernah memuat API key', async () => {
  const view = settings.mainBotSettingsView()
  assert.equal(view.bot_name, 'Umi Test')
  assert.equal(view.menu_audio_enabled, true)
  assert.ok(!JSON.stringify(view).toLowerCase().includes('api_key'))
})

test.after(() => {
  process.chdir(oldCwd)
  fs.rmSync(temp, { recursive: true, force: true })
  delete process.env.UMI_MAIN_BOT_SETTINGS_FILE
})
