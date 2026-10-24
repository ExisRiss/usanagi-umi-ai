/* By AlzRiss - Usanagi Umi AI */

export async function getGroupMetadata(conn, groupId) {
  if (!groupId?.endsWith('@g.us') || typeof conn?.groupMetadata !== 'function') {
    throw new Error('Target group tidak valid.')
  }

  return conn.groupMetadata(groupId)
}

export async function setGroupClosed(conn, groupId) {
  if (typeof conn?.groupSettingUpdate !== 'function') {
    throw new Error('WhatsApp connection tidak mendukung pengaturan mode group.')
  }

  await conn.groupSettingUpdate(groupId, 'announcement')
  return 'closed'
}

export async function setGroupOpen(conn, groupId) {
  if (typeof conn?.groupSettingUpdate !== 'function') {
    throw new Error('WhatsApp connection tidak mendukung pengaturan mode group.')
  }

  await conn.groupSettingUpdate(groupId, 'not_announcement')
  return 'open'
}

export async function setGroupMode(conn, groupId, mode) {
  if (mode === 'closed') return setGroupClosed(conn, groupId)
  if (mode === 'open') return setGroupOpen(conn, groupId)
  throw new Error('Mode group tidak valid.')
}

export async function getGroupStatus(metadata) {
  return metadata?.announce ? 'closed' : 'open'
}

export default {
  getGroupMetadata,
  setGroupClosed,
  setGroupOpen,
  setGroupMode,
  getGroupStatus,
}
