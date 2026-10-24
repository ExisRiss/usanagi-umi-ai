import test from 'node:test'
import assert from 'node:assert/strict'
import { can, normalizeRole, roleFromWebRoles, canAssignRole, permissionsOf, requirePermission, ROLES } from '../../lib/platform/roles.js'

test('role tidak dikenal jatuh ke user (default-deny)', () => {
  assert.equal(normalizeRole('superadmin'), 'user')
  assert.equal(normalizeRole(''), 'user')
  assert.equal(normalizeRole(null), 'user')
  for (const role of ROLES) assert.equal(normalizeRole(role), role)
})

test('matriks izin: owner penuh, user minimal', () => {
  assert.equal(can('owner', 'platform.manage'), true)
  assert.equal(can('owner', 'server.control'), true)
  assert.equal(can('developer', 'server.control'), true)
  assert.equal(can('developer', 'platform.roles.manage'), false)
  assert.equal(can('admin', 'server.control'), false)
  assert.equal(can('admin', 'server.read'), true)
  assert.equal(can('reseller', 'platform.users.read'), false)
  assert.equal(can('user', 'media.upload'), true)
  assert.equal(can('user', 'server.read'), false)
  assert.equal(can('user', 'telegram.manage'), false)
  assert.equal(can('owner', 'permission.tidak.ada'), false)
})

test('requirePermission melempar 403 dengan nama izin', () => {
  assert.throws(() => requirePermission('user', 'server.control'), error => {
    assert.equal(error.status, 403)
    assert.equal(error.permission, 'server.control')
    return true
  })
  assert.equal(requirePermission('owner', 'server.control'), true)
})

test('pemetaan role website', () => {
  assert.equal(roleFromWebRoles(['user']), 'user')
  assert.equal(roleFromWebRoles(['partner']), 'reseller')
  assert.equal(roleFromWebRoles(['admin', 'user']), 'admin')
  assert.equal(roleFromWebRoles(['developer', 'owner']), 'owner')
  assert.equal(roleFromWebRoles(null), 'user')
})

test('hanya owner yang boleh memberi role owner; developer hanya menurunkan', () => {
  assert.equal(canAssignRole('owner', 'owner'), true)
  assert.equal(canAssignRole('developer', 'owner'), false)
  assert.equal(canAssignRole('admin', 'owner'), false)
  assert.equal(canAssignRole('developer', 'admin'), true)
  assert.equal(canAssignRole('admin', 'owner'), false)
  assert.equal(canAssignRole('admin', 'user'), true)
  assert.equal(canAssignRole('user', 'admin'), false)
  assert.equal(canAssignRole('reseller', 'user'), false)
})

test('daftar izin per role konsisten', () => {
  assert.ok(permissionsOf('owner').length > permissionsOf('developer').length)
  assert.ok(permissionsOf('developer').length > permissionsOf('admin').length)
  // Batch 13: pengguna biasa boleh menghubungkan bot Telegram miliknya sendiri
  // (telegram.own), tetapi tetap tidak boleh menyentuh bot platform.
  assert.deepEqual(permissionsOf('user').sort(), [
    'media.delete.own', 'media.upload', 'rpg.read', 'session.own',
    'stock.read', 'stock.trade', 'telegram.own',
  ].sort())
  for (const permission of ['telegram.manage', 'telegram.status', 'mainbot.manage', 'platform.users.read', 'platform.audit.read']) {
    assert.equal(can('user', permission), false, `pengguna biasa tidak boleh punya ${permission}`)
  }
  // Nomor bot utama = khusus owner.
  assert.equal(can('owner', 'mainbot.manage'), true)
  assert.equal(can('developer', 'mainbot.manage'), false)
})
