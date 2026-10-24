
import { settings } from '../../config/settings.js'
import { removeDynamicOwner } from '../../core/awang-ownerdb.js'
import { normalizeNumber, resolveTargetPhoneNumber } from '../../lib/awang-cekakses.js'

function unwrapMessage(message) {
  let current = message || {}
  for (let i = 0; i < 8; i++) {
    const next =
      current?.ephemeralMessage?.message ||
      current?.viewOnceMessage?.message ||
      current?.viewOnceMessageV2?.message ||
      current?.viewOnceMessageV2Extension?.message ||
      current?.documentWithCaptionMessage?.message
    if (!next || next === current) break
    current = next
  }
  return current || {}
}

function getContextInfo(message) {
  const current = unwrapMessage(message)
  return (
    current?.extendedTextMessage?.contextInfo ||
    current?.imageMessage?.contextInfo ||
    current?.videoMessage?.contextInfo ||
    current?.documentMessage?.contextInfo ||
    current?.documentWithCaptionMessage?.message?.contextInfo ||
    current?.contextInfo ||
    null
  )
}

function extractName(text) {
  const raw = String(text ?? '')
  const separator = raw.indexOf('|')
  if (separator < 0) return ''
  return raw.slice(separator + 1).replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 64)
}

function extractNumber(text) {
  const raw = String(text ?? '').replace(/[,;]/g, ' ')
  const matches = raw.match(/\+?\d[\d\s().-]*\d/g) || []
  for (const candidate of matches) {
    const number = normalizeNumber(candidate)
    if (number.length >= 7 && number.length <= 15) return number
  }
  return null
}

async function resolveTargetJid(jid, conn, chat) {
  return resolveTargetPhoneNumber(jid, conn, chat)
}

async function resolveTargetFromMessage(m, conn) {
  const context = getContextInfo(m.raw?.message)
  const mentioned = Array.isArray(context?.mentionedJid) ? context.mentionedJid.filter(Boolean) : []
  const suppliedName = extractName(m.text)

  if (mentioned.length) {
    for (const jid of mentioned) {
      const number = await resolveTargetJid(jid, conn, m.chat)
      if (number) return { number, source: 'mention', suppliedName }
    }
  }

  if (context?.participant) {
    const number = await resolveTargetJid(context.participant, conn, m.chat)
    if (number) return { number, source: 'reply', suppliedName }
  }

  const number = extractNumber(m.text)
  if (number) return { number, source: 'number', suppliedName }

  return null
}

function getConfiguredOwners() {
  return (Array.isArray(settings.ownerNumbers) ? settings.ownerNumbers : [])
    .map(normalizeNumber)
    .filter(Boolean)
}

const handler = async (m, { conn, usedPrefix }) => {
  const target = await resolveTargetFromMessage(m, conn)
  if (!target) {
    await conn.sendMessage(
      m.chat,
      { text: `Cara pakai:\n${usedPrefix}delowner @user | Nama\n${usedPrefix}delowner <nomor> | Nama\natau reply pesan owner dengan ${usedPrefix}delowner | Nama` },
      { quoted: m.raw }
    )
    return
  }

  const configuredOwners = getConfiguredOwners()
  if (configuredOwners.includes(target.number)) {
    await conn.sendMessage(
      m.chat,
      { text: `Nomor *${target.number}* adalah owner utama dengan nama *${settings.ownerName || 'Owner'}* dan tidak dapat dilepas lewat delowner.` },
      { quoted: m.raw }
    )
    return
  }

  const botNumber = normalizeNumber(conn?.user?.id || '')
  if (botNumber && botNumber === target.number) {
    await conn.sendMessage(
      m.chat,
      { text: 'Nomor bot tidak dapat dilepas sebagai owner.' },
      { quoted: m.raw }
    )
    return
  }

  const result = removeDynamicOwner(target.number)

  if (result.reason === 'not_found') {
    await conn.sendMessage(
      m.chat,
      { text: `Nomor *${result.number}* tidak ditemukan sebagai owner tambahan.` },
      { quoted: m.raw }
    )
    return
  }

  if (result.reason !== 'removed') {
    await conn.sendMessage(
      m.chat,
      { text: 'Nomor target tidak valid atau tidak dapat diproses.' },
      { quoted: m.raw }
    )
    return
  }

  await conn.sendMessage(
    m.chat,
    {
      text:
        `✅ *Owner berhasil dihapus*\n\n` +
        `Nama: *${result.name || target.suppliedName || 'Owner'}*\n` +
        `Nomor: *${result.number}*\n` +
        `Status: *User biasa*\n` +
        `Sumber: *${target.source}*`,
    },
    { quoted: m.raw }
  )
}

handler.command = /^delowner$/i
handler.help = ['delowner']
handler.tags = ['owner']
handler.description = 'Menghapus owner tambahan melalui mention, reply, atau nomor'
handler.ownerOnly = true
handler.rowner = true

export default handler
