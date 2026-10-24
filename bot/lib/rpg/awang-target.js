/* By AlzRiss - Usanagi Umi AI */

function getContextInfo(m) {
  const content = m.raw?.message?.ephemeralMessage?.message || m.raw?.message
  return (
    content?.extendedTextMessage?.contextInfo ||
    content?.imageMessage?.contextInfo ||
    content?.videoMessage?.contextInfo ||
    null
  )
}

function getMentionedJids(m) {
  const ctx = getContextInfo(m)
  return Array.isArray(ctx?.mentionedJid) ? ctx.mentionedJid : []
}

function getQuotedSender(m) {
  const ctx = getContextInfo(m)
  return ctx?.participant || null
}

function resolveTarget(m) {
  return getMentionedJids(m)[0] || getQuotedSender(m) || null
}

export { getMentionedJids, getQuotedSender, resolveTarget }

export default { getMentionedJids, getQuotedSender, resolveTarget }
