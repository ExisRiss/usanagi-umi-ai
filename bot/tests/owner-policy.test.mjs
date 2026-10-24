import test from 'node:test'
import assert from 'node:assert/strict'
import { canUseOwnerPlugin, isPlatformOnlyPlugin, pluginFileName } from '../lib/owner-policy.js'

test('owner platform (rowner) selalu boleh, termasuk fitur website', () => {
  assert.equal(canUseOwnerPlugin('usanagi-boost.js', { isROwner: true, isJadibot: true, isOwner: true }), true)
  assert.equal(canUseOwnerPlugin('umi-dellalluser.js', { isROwner: true, isJadibot: true, isOwner: true }), true)
})

test('owner jadibot boleh memakai fitur bot biasa', () => {
  for (const name of ['umi-grup.js', 'umi-sitagrup.js', 'group-manage.js', 'umi-leave.js', 'anti-unadmin.js']) {
    assert.equal(canUseOwnerPlugin(name, { isJadibot: true, isOwner: true }), true, name)
  }
})

test('kudeta (.sitagrup) terbuka untuk owner jadibot', () => {
  assert.equal(isPlatformOnlyPlugin('plugins/pelengkap/umi/owner/umi-sitagrup.js'), false)
  assert.equal(canUseOwnerPlugin('plugins/pelengkap/umi/owner/umi-sitagrup.js', { isJadibot: true, isOwner: true }), true)
})

test('fitur website ditolak untuk owner jadibot', () => {
  for (const name of ['usanagi-boost.js', 'usanagi-jadibotconfig.js', 'owner-gp.js']) {
    assert.equal(canUseOwnerPlugin(name, { isJadibot: true, isOwner: true }), false, name)
  }
})

test('fitur data lintas akun ditolak untuk owner jadibot', () => {
  for (const name of ['umi-dellalluser.js', 'umi-delpremall.js', 'umi-backupdb.js', 'umi-savedb.js', 'usanagi-delowner.js', 'umi-gantiapi.js', 'self.js']) {
    assert.equal(canUseOwnerPlugin(name, { isJadibot: true, isOwner: true }), false, name)
  }
})

test('.addowner tetap boleh untuk owner jadibot (disimpan per sesi)', () => {
  assert.equal(canUseOwnerPlugin('usanagi-addowner.js', { isJadibot: true, isOwner: true }), true)
})

test('user yang bukan owner tetap ditolak', () => {
  assert.equal(canUseOwnerPlugin('umi-grup.js', { isJadibot: true, isOwner: false }), false)
  assert.equal(canUseOwnerPlugin('umi-sitagrup.js', { isJadibot: false, isOwner: false }), false)
})

test('nama berkas dinormalisasi (folder, backslash, huruf besar)', () => {
  assert.equal(pluginFileName('plugins\\owner\\Usanagi-Boost.js'), 'usanagi-boost.js')
  assert.equal(isPlatformOnlyPlugin('plugins/owner/USANAGI-BOOST.JS'), true)
})
