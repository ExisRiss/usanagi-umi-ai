import { unifiedRpg } from './unified-store.js'

import { settings } from '../../config/settings.js'
import { getUser, recordRpgActivity } from './awang-db.js'
import { formatRpgText } from './awang-format.js'
import { sendRpgCard } from './awang-ui.js'
import { resolveTarget, getMentionedJids, getQuotedSender } from './awang-target.js'
import { createMutableMessageView } from './awang-message-view.js'

const textResponseLedger = new WeakMap()

function buildRpgContext(m, { conn, usedPrefix }) {
  const enriched = createMutableMessageView(m)
  const originalQuoted = m.quoted

  enriched.prefix = usedPrefix || settings.defaultPrefix
  enriched.mentionedJid = getMentionedJids(m)
  enriched.quoted = originalQuoted
    ? { sender: getQuotedSender(m), message: originalQuoted }
    : getQuotedSender(m)
      ? { sender: getQuotedSender(m), message: null }
      : null
  enriched.targetJid = resolveTarget(m)
  const store = unifiedRpg()
  if (store) {
    const sender = store.identity(m.sender)
    if (!sender) store.reject('Identitas RPG belum terverifikasi.')
    Object.defineProperty(enriched, 'sender', { value: sender + '@s.whatsapp.net', writable: true, configurable: true, enumerable: true })
    const target = store.identity(enriched.targetJid)
    if (target) enriched.targetJid = target + '@s.whatsapp.net'
  }

  enriched.rpgFeatureKey = String(m.command || 'reward').toLowerCase()
  enriched.reply = async (text, extra = {}) => {
    if (extra.rpgCanvas === true) {
      return sendRpgCard(conn, enriched, {
        type: extra.rpgType || 'feature',
        featureKey: extra.rpgFeatureKey || enriched.rpgFeatureKey,
        headerTitle: extra.rpgTitle || String(m.command || 'RPG').toUpperCase(),
        headerSubtitle: extra.rpgSubtitle || '',
        body: formatRpgText(text),
        mentions: extra.mentions || [],
        buttons: extra.buttons || [],
        data: extra.rpgData || {},
        quoted: Object.prototype.hasOwnProperty.call(extra, 'quoted') ? extra.quoted : m.raw,
      })
    }
    const formatted = extra.rpgFormat === false ? text : formatRpgText(text)
    const ledger = textResponseLedger.get(m) || new Set()
    const responseKey = String(formatted || '').trim()
    if (responseKey && ledger.has(responseKey)) return null
    if (responseKey) {
      ledger.add(responseKey)
      if (ledger.size > 8) ledger.delete(ledger.values().next().value)
      textResponseLedger.set(m, ledger)
    }
    const payload = { text: formatted, ...extra }
    delete payload.rpgFormat
    delete payload.rpgCanvas
    delete payload.rpgType
    delete payload.rpgFeatureKey
    delete payload.rpgTitle
    delete payload.rpgSubtitle
    delete payload.rpgData
    return conn.sendMessage(m.chat, payload, { quoted: Object.prototype.hasOwnProperty.call(extra, 'quoted') ? extra.quoted : m.raw })
  }
  enriched.rpgTextResult = async (text, extra = {}) => {
    const levelUp = enriched.rpgLevelUpEvent || null
    let resultText = String(text || '')
    if (levelUp && !resultText.toLowerCase().includes('level naik')) {
      resultText += `${resultText ? '\n' : ''}Level naik: ${levelUp.oldLevel} → ${levelUp.newLevel} (${levelUp.role})`
    }
    enriched.rpgLevelUpEvent = null
    return enriched.reply(resultText, { ...extra, rpgCanvas: false })
  }
  enriched.rpgResult = async (text, extra = {}) => {
    const user = getUser(m.sender)
    recordRpgActivity(m.sender, user, extra.rpgFeatureKey || enriched.rpgFeatureKey || m.command, m.raw?.key?.id || '')
    const coreStats = {
      level: user.level,
      exp: user.exp,
      koin: user.koin,
      health: user.rpg.health,
      maxHealth: user.rpg.maxHealth,
      mana: user.rpg.mana,
      maxMana: user.rpg.maxMana,
      stamina: user.rpg.stamina,
      maxStamina: user.rpg.maxStamina,
      attack: user.rpg.attack,
      defense: user.rpg.defense,
      speed: user.rpg.speed,
      luck: user.rpg.luck,
      activityStats: { ...(user.rpg.stats || {}) },
    }
    const data = { ...coreStats, ...(extra.rpgData || {}) }
    return sendRpgCard(conn, enriched, {
      type: extra.rpgType || 'feature',
      featureKey: extra.rpgFeatureKey || enriched.rpgFeatureKey,
      headerTitle: extra.rpgTitle || String(m.command || 'RPG').toUpperCase(),
      headerSubtitle: extra.rpgSubtitle || '',
      body: formatRpgText(text),
      mentions: extra.mentions || [],
      buttons: extra.buttons || [],
      data,
      quoted: Object.prototype.hasOwnProperty.call(extra, 'quoted') ? extra.quoted : m.raw,
    })
  }

  enriched.react = async (emoji) => {
    try {
      await conn.sendMessage(m.chat, { react: { text: emoji, key: m.raw.key } })
    } catch {

    }
  }

  return { m: enriched, sock: conn }
}

export { buildRpgContext }

export default { buildRpgContext }
