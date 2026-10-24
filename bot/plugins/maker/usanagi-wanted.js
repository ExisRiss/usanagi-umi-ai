/* By AlzRiss - Usanagi Umi AI */

import sharp from 'sharp'

const esc = value => String(value || '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[char]))

async function resolvePhoto(m, conn) {
  try {
    if (m.quoted?.download) {
      const buffer = await m.quoted.download()
      if (buffer?.length) return buffer
    }
  } catch {}
  try {
    const url = await conn.profilePictureUrl(m.sender, 'image')
    const response = await fetch(url, { signal: AbortSignal.timeout(12000) })
    if (response.ok) return Buffer.from(await response.arrayBuffer())
  } catch {}
  return null
}

async function createPoster({ photo, name, alias, bounty }) {
  const width = 720
  const height = 1020
  const base = await sharp({
    create: { width, height, channels: 4, background: '#c8b17f' },
  }).png().toBuffer()

  let portrait
  if (photo) {
    portrait = await sharp(photo).resize(590, 450, { fit: 'cover', position: 'centre' }).grayscale().tint('#9b7748').jpeg({ quality: 90 }).toBuffer()
  } else {
    portrait = await sharp({ create: { width: 590, height: 450, channels: 3, background: '#816a48' } }).jpeg().toBuffer()
  }

  const safeName = esc(Array.from(name.toUpperCase()).slice(0, 24).join(''))
  const safeAlias = esc(Array.from(alias).slice(0, 40).join(''))
  const safeBounty = Number(bounty).toLocaleString('en-US')
  const overlay = Buffer.from(`<svg width="720" height="1020" xmlns="http://www.w3.org/2000/svg">
    <defs><filter id="rough"><feTurbulence baseFrequency=".65" numOctaves="3" seed="8" result="noise"/><feBlend in="SourceGraphic" in2="noise" mode="multiply"/></filter></defs>
    <rect x="15" y="15" width="690" height="990" rx="5" fill="none" stroke="#4a3218" stroke-width="7"/>
    <rect x="26" y="26" width="668" height="968" fill="none" stroke="#79562d" stroke-width="2"/>
    <text x="360" y="132" text-anchor="middle" font-family="Georgia,serif" font-weight="900" font-size="112" fill="#38230f">WANTED</text>
    <text x="360" y="180" text-anchor="middle" font-family="Georgia,serif" font-size="27" font-weight="700" fill="#51361a">DEAD OR ALIVE</text>
    <rect x="58" y="210" width="604" height="464" fill="none" stroke="#4a3218" stroke-width="8"/>
    <text x="360" y="742" text-anchor="middle" font-family="Georgia,serif" font-weight="900" font-size="54" fill="#38230f">${safeName}</text>
    ${safeAlias ? `<text x="360" y="785" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-size="23" fill="#674823">“${safeAlias}”</text>` : ''}
    <line x1="80" y1="820" x2="640" y2="820" stroke="#60401e" stroke-width="2"/>
    <text x="360" y="890" text-anchor="middle" font-family="Georgia,serif" font-weight="900" font-size="55" fill="#38230f">฿ ${safeBounty}</text>
    <text x="360" y="950" text-anchor="middle" font-family="Georgia,serif" font-size="20" font-weight="700" fill="#51361a">MARINE · USANAGI UMI AI</text>
    <rect width="720" height="1020" opacity=".11" filter="url(#rough)"/>
  </svg>`)

  return sharp(base)
    .composite([{ input: portrait, left: 65, top: 217 }, { input: overlay, left: 0, top: 0 }])
    .jpeg({ quality: 92 })
    .toBuffer()
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
  const [rawName, rawBounty, rawAlias] = String(text || '').split('|').map(value => value.trim())
  const name = rawName || m.pushName || String(m.sender).split('@')[0]
  const bounty = Math.max(1, Math.min(999999999999, Number(String(rawBounty || '').replace(/\D/g, '')) || Math.floor(Math.random() * 4900000000 + 100000000)))
  if (!text && !m.quoted) return m.reply(`Format: ${usedPrefix}${command} nama | bounty | alias\nAtau reply foto lalu gunakan command tersebut.`)
  await m.react?.('⏳')
  try {
    const image = await createPoster({ photo: await resolvePhoto(m, conn), name, alias: rawAlias || '', bounty })
    await conn.sendMessage(m.chat, { image, caption: `🏴‍☠️ *WANTED POSTER*\n\n${name} · ฿ ${bounty.toLocaleString('en-US')}\n\nBy AlzRiss - Usanagi Umi AI` }, { quoted: m.raw })
    await m.react?.('✅')
  } catch (error) {
    console.error('[WANTED]', error)
    await m.react?.('❌')
    return m.reply(`Gagal membuat poster: ${error.message}`)
  }
}

handler.command = /^(wanted|bounty)$/i
handler.help = ['wanted nama | bounty | alias']
handler.tags = ['maker']
handler.limit = true
handler.description = 'Membuat poster buronan bergaya klasik'

export default handler
