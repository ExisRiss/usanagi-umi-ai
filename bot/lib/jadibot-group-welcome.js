/* By AlzRiss - Usanagi Umi AI */

import { saveJadibotConfig } from './bot-config.js'

const GROUP_ID_PATTERN = /^\d{5,25}(?:-\d{5,25})?@g\.us$/
const MAX_TEMPLATE_LENGTH = 4096

function normalizeGroupId(value) {
  const groupId = String(value || '').trim()
  return GROUP_ID_PATTERN.test(groupId) ? groupId : ''
}

function normalizeTemplate(value) {
  return String(value ?? '').replace(/\u0000/g, '').trim().slice(0, MAX_TEMPLATE_LENGTH)
}

function sessionProfile(conn) {
  return conn?.botConfig?.type === 'jadibot' ? conn.botConfig : null
}

function templateKey(action) {
  return action === 'goodbye' ? 'groupGoodbyeTemplates' : 'groupWelcomeTemplates'
}

function getSessionTemplate(conn, groupId, action) {
  const profile = sessionProfile(conn)
  const id = normalizeGroupId(groupId)
  if (!profile || !id) return ''
  return normalizeTemplate(profile.values?.[templateKey(action)]?.[id])
}

function setSessionTemplate(conn, groupId, template, action) {
  const profile = sessionProfile(conn)
  const id = normalizeGroupId(groupId)
  const text = normalizeTemplate(template)
  if (!profile || !id || !text) return false

  profile.values ||= {}
  const key = templateKey(action)
  profile.values[key] ||= {}
  profile.values[key][id] = text
  saveJadibotConfig(profile)
  return true
}

function clearSessionTemplate(conn, groupId, action) {
  const profile = sessionProfile(conn)
  const id = normalizeGroupId(groupId)
  const key = templateKey(action)
  if (!profile || !id || !profile.values?.[key]?.[id]) return false

  delete profile.values[key][id]
  saveJadibotConfig(profile)
  return true
}

export const getSessionWelcomeTemplate = (conn, groupId) => getSessionTemplate(conn, groupId, 'welcome')
export const setSessionWelcomeTemplate = (conn, groupId, template) => setSessionTemplate(conn, groupId, template, 'welcome')
export const clearSessionWelcomeTemplate = (conn, groupId) => clearSessionTemplate(conn, groupId, 'welcome')

export const getSessionGoodbyeTemplate = (conn, groupId) => getSessionTemplate(conn, groupId, 'goodbye')
export const setSessionGoodbyeTemplate = (conn, groupId, template) => setSessionTemplate(conn, groupId, template, 'goodbye')
export const clearSessionGoodbyeTemplate = (conn, groupId) => clearSessionTemplate(conn, groupId, 'goodbye')

export default {
  getSessionWelcomeTemplate,
  setSessionWelcomeTemplate,
  clearSessionWelcomeTemplate,
  getSessionGoodbyeTemplate,
  setSessionGoodbyeTemplate,
  clearSessionGoodbyeTemplate,
}
