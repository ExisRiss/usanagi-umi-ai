import { unifiedRpg } from './rpg/unified-store.js'
/* By AlzRiss - Usanagi Umi AI */

function isUserJid(value) {
  return /@(s\.whatsapp\.net|lid)$/.test(String(value || ''))
}

export function collectUserIdentityKeys(message, resolvedNumber = '') {
  const canonical = resolvedNumber ? `${String(resolvedNumber).replace(/\D/g, '')}@s.whatsapp.net` : ''
  return [...new Set([
    message?.sender,
    canonical,
    message?.key?.participantAlt,
    message?.key?.participant,
    message?.participant
  ].map(value => String(value || '')).filter(isUserJid))]
}

export function mergeUserIdentityRecords(users, keys) {
  if (!users || typeof users !== 'object') throw new TypeError('users database tidak valid')
  const validKeys = [...new Set((keys || []).map(String).filter(isUserJid))]
  if (!validKeys.length) return {}
  const unified = unifiedRpg()?.bind(validKeys)
  if (unified) return unified

  // Record terdaftar ditempatkan paling akhir agar status, nama, usia, dan
  // regTime tidak ditimpa record alias LID yang baru dibuat.
  const records = validKeys
    .map(key => users[key])
    .filter(value => value && typeof value === 'object')
    .sort((a, b) => {
      const registered = Number(Boolean(a.registered)) - Number(Boolean(b.registered))
      if (registered) return registered
      return Object.keys(a).length - Object.keys(b).length
    })

  const merged = Object.assign({}, ...records)
  if (records.some(record => record.registered === true)) merged.registered = true
  for (const key of validKeys) users[key] = merged
  return merged
}

export default { collectUserIdentityKeys, mergeUserIdentityRecords }
