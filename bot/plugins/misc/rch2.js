import { getMainConnection } from '../../lib/bot-connection-context.js'
/**
 * React to a WhatsApp Channel post from the main bot and every connected
 * Jadibot session. Each WhatsApp account sends its own reaction directly.
 */

import { getSubBots } from '../../lib/jadibot.js'

const MAX_EMOJIS = 5
const PARALLEL_BOTS = 4
const INVISIBLE = /[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/g
const EMOJI_ONLY = /^[\p{Extended_Pictographic}\p{Regional_Indicator}\p{Emoji_Modifier}\u200D\uFE0F\u20E3#*0-9]+$/u

function usage(prefix, command) {
  return [
    '❌ Kirim link *pesan* WhatsApp Channel dan 1–5 emoji.',
    '',
    'Pisahkan emoji dengan koma.',
    '',
    'Contoh:',
    `${prefix}${command} https://whatsapp.com/channel/0029Vb.../436 🎉,⚡`,
    '',
    'Link harus berakhir dengan nomor post, misalnya `/436`.',
  ].join('\n')
}

function parseInput(value) {
  const input = String(value || '').replace(INVISIBLE, '').trim()
  const match = input.match(/(?:https?:\/\/)?(?:www\.)?whatsapp\.com\/channel\/([A-Za-z0-9_-]+)\/(\d{1,24})(?=$|[/?#\s])/i)
  if (!match) return null

  const after = input.slice((match.index || 0) + match[0].length).trim()
  const emojis = [...new Set(after.split(',').map(item => item.trim()).filter(Boolean))]
  return { invite: match[1], postId: match[2], emojis }
}

function validEmoji(value) {
  return value.length > 0 && value.length <= 32 && EMOJI_ONLY.test(value)
}

async function withTimeout(task, timeoutMs) {
  let timer
  try {
    return await Promise.race([
      Promise.resolve(task),
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('timeout')), timeoutMs) }),
    ])
  } finally {
    clearTimeout(timer)
  }
}

function allReactionConnections() {
  const connections = []
  const seen = new Set()
  const add = (conn, type) => {
    if (!conn?.user?.id || typeof conn.newsletterMetadata !== 'function' || typeof conn.newsletterReactMessage !== 'function') return
    if (seen.has(conn)) return
    seen.add(conn)
    connections.push({ conn, type })
  }

  // The main connection reacts using the main bot number.
  add(getMainConnection(), 'main')
  // Only currently connected sessions are used; offline sessions are never
  // woken or paired as a side-effect of an owner command.
  for (const [, conn] of getSubBots()) {
    if (conn?.__jadibotConnected === true) add(conn, 'jadibot')
  }
  return connections
}

async function reactFromConnection(conn, invite, postId, emoji) {
  const metadata = await withTimeout(conn.newsletterMetadata('invite', invite), 15000)
  const channelId = String(metadata?.id || '').trim()
  if (!channelId.endsWith('@newsletter')) throw new Error('channel not found')
  await withTimeout(conn.newsletterReactMessage(channelId, postId, emoji), 15000)
}

function publicFailure(error) {
  const message = String(error?.message || error || '')
  if (/not.?follow|subscribe|newsletter|permission|forbidden|unauthori[sz]ed/i.test(message)) return 'not_following'
  if (/timeout|timed out|network|connection/i.test(message)) return 'connection'
  return 'other'
}

async function runInBatches(jobs, width = PARALLEL_BOTS) {
  const results = []
  for (let index = 0; index < jobs.length; index += width) {
    const batch = await Promise.all(jobs.slice(index, index + width).map(job => job()))
    results.push(...batch)
  }
  return results
}

const handler = async (m, { text, usedPrefix, command }) => {
  const parsed = parseInput(text)
  if (!parsed || !parsed.emojis.length) return m.reply(usage(usedPrefix, command))
  if (parsed.emojis.length > MAX_EMOJIS) return m.reply(`❌ Maksimal ${MAX_EMOJIS} emoji dipisahkan dengan koma.`)
  if (!parsed.emojis.every(validEmoji)) return m.reply('❌ Format emoji tidak valid. Pisahkan emoji dengan koma, contoh: 🎉,⚡')

  const connections = allReactionConnections()
  if (!connections.length) return m.reply('❌ Bot utama dan Jadibot yang terhubung tidak tersedia untuk mengirim reaction.')

  await m.reply(`⏳ Mengirim reaction dari Bot Utama + ${Math.max(0, connections.length - 1)} Jadibot aktif...`)

  const jobs = connections.map(({ conn, type }, index) => async () => {
    const emoji = parsed.emojis[index % parsed.emojis.length]
    try {
      await reactFromConnection(conn, parsed.invite, parsed.postId, emoji)
      return { ok: true, type, emoji }
    } catch (error) {
      return { ok: false, type, reason: publicFailure(error) }
    }
  })
  const results = await runInBatches(jobs)
  const succeeded = results.filter(item => item.ok)
  const failed = results.filter(item => !item.ok)
  const mainSuccess = succeeded.some(item => item.type === 'main')
  const jadibotSuccess = succeeded.filter(item => item.type === 'jadibot').length
  const notFollowing = failed.filter(item => item.reason === 'not_following').length

  const lines = [
    succeeded.length ? '✅ *REACTION SELESAI*' : '⚠️ *REACTION BELUM TERKIRIM*',
    '',
    `• Bot utama: ${mainSuccess ? 'berhasil' : 'gagal/tidak tersedia'}`,
    `• Jadibot berhasil: ${jadibotSuccess}`,
    `• Total berhasil: ${succeeded.length}/${connections.length}`,
    `• Emoji rotasi: ${parsed.emojis.join(', ')}`,
  ]
  if (notFollowing) lines.push(`• ${notFollowing} bot perlu mengikuti Channel atau tidak mendapat izin reaction.`)
  if (failed.length && !notFollowing) lines.push('• Sebagian bot gagal karena koneksi atau post Channel tidak dapat diakses.')
  await m.reply(lines.join('\n'))
}

handler.help = ['rch2 <link-post-channel> <emoji1,emoji2,...>']
handler.tags = ['owner']
handler.command = /^(rch2|reactchannel2|reactch2)$/i
// This command directs all connected WhatsApp accounts, including other
// users' Jadibot sessions. It is therefore restricted to the real main owner.
handler.rowner = true

export default handler
