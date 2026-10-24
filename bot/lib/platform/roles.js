/**
 * RBAC terpusat untuk seluruh adapter (WhatsApp, Telegram, panel web).
 *
 * Aturan: role SELALU dibaca dari database (`platform_users.role`), tidak pernah
 * dari teks command, username Telegram, atau parameter yang dikirim klien.
 */

export const ROLES = ['owner', 'developer', 'admin', 'reseller', 'user']

/** Peta permission → role yang boleh. */
export const PERMISSIONS = {
  'platform.manage': ['owner'],
  'platform.roles.manage': ['owner'],
  'platform.audit.read': ['owner', 'developer'],
  'platform.users.read': ['owner', 'developer', 'admin'],
  'platform.users.manage': ['owner', 'admin'],
  'telegram.manage': ['owner', 'developer'],
  // Bot Telegram milik sendiri: semua peran boleh menghubungkan token bot buatan
  // mereka sendiri ke bot WhatsApp miliknya. Tidak memberi akses ke bot orang lain
  // (kepemilikan selalu dicek dari database, bukan dari klaim klien).
  'telegram.own': ['owner', 'developer', 'admin', 'reseller', 'user'],
  'telegram.status': ['owner', 'developer', 'admin'],
  // Nomor bot utama platform: hanya owner (permintaan pemilik, 2026-10-20).
  'mainbot.manage': ['owner'],
  // Mode premium platform: owner & developer boleh mematikan/menyalakan.
  'premium.manage': ['owner', 'developer'],
  'server.read': ['owner', 'developer', 'admin'],
  'server.panel.manage': ['owner', 'developer'],
  'server.control': ['owner', 'developer'],
  'server.logs': ['owner', 'developer'],
  'stock.read': ['owner', 'developer', 'admin', 'reseller', 'user'],
  'stock.manage': ['owner', 'developer'],
  'stock.trade': ['owner', 'developer', 'admin', 'reseller', 'user'],
  'rpg.read': ['owner', 'developer', 'admin', 'reseller', 'user'],
  'rpg.manage': ['owner', 'developer'],
  'media.upload': ['owner', 'developer', 'admin', 'reseller', 'user'],
  'media.delete.own': ['owner', 'developer', 'admin', 'reseller', 'user'],
  'media.delete.any': ['owner', 'developer', 'admin'],
  'session.own': ['owner', 'developer', 'admin', 'reseller', 'user'],
  'session.any': ['owner', 'developer'],
  'reseller.read': ['owner', 'developer', 'admin', 'reseller'],
  'reseller.customers': ['owner', 'developer', 'admin', 'reseller'],
  'monitor.read': ['owner', 'developer', 'admin'],
}

export function normalizeRole(value) {
  const role = String(value || '').trim().toLowerCase()
  return ROLES.includes(role) ? role : 'user'
}

/** Turunkan role dari daftar role website (owner > developer > admin > user). */
export function roleFromWebRoles(roles) {
  const list = Array.isArray(roles) ? roles.map(item => String(item || '').toLowerCase()) : []
  for (const role of ['owner', 'developer', 'admin']) if (list.includes(role)) return role
  if (list.includes('reseller') || list.includes('partner')) return 'reseller'
  return 'user'
}

export function can(role, permission) {
  const allowed = PERMISSIONS[permission]
  if (!allowed) return false
  return allowed.includes(normalizeRole(role))
}

export function requirePermission(role, permission) {
  if (can(role, permission)) return true
  throw Object.assign(new Error('Akses ditolak. Peran Anda tidak punya izin ini.'), { status: 403, permission })
}

export function permissionsOf(role) {
  const normalized = normalizeRole(role)
  return Object.entries(PERMISSIONS).filter(([, roles]) => roles.includes(normalized)).map(([name]) => name)
}

export function roleRank(role) {
  return ROLES.indexOf(normalizeRole(role))
}

/**
 * Apakah `a` lebih tinggi dari `b`?
 * Catatan: ROLES disusun dari tertinggi ke terendah, jadi indeks KECIL = lebih
 * tinggi. Helper ini ada supaya pemanggil tidak salah arah perbandingan.
 */
export function outranks(a, b) {
  return roleRank(a) < roleRank(b)
}

/** Hanya owner yang boleh memberi/mencabut role owner. */
export function canAssignRole(actorRole, targetRole) {
  const actor = normalizeRole(actorRole)
  const target = normalizeRole(targetRole)
  if (actor === 'owner') return true
  if (actor !== 'developer' && actor !== 'admin') return false
  return roleRank(target) > roleRank(actor)
}
