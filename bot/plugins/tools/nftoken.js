// plugins/nftoken.mjs
/*
📌 Nama Fitur: NF Token Generator (Netflix)
🏷️ Type: Plugin ESM
📝 Deskripsi: Generate NF Token Netflix via API Omegatech
🌐 Base URL: https://api.omegatech.app
📌 Command: .nftoken
*/

import axios from 'axios'

const CONFIG = {
  BASE_URL: 'https://api.omegatech.app/api/tools/Nftoken',
  TIMEOUT: 30000,
  USER_AGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
}

// ===============================
// GENERATE NF TOKEN
// ===============================
export async function generateNftoken() {
  try {
    const res = await axios.get(CONFIG.BASE_URL, {
      params: { action: 'generate' },
      timeout: CONFIG.TIMEOUT,
      headers: {
        'User-Agent': CONFIG.USER_AGENT,
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9,id;q=0.8'
      }
    })

    const data = res.data

    if (!data.success || !data.data?.token) {
      return {
        success: false,
        error: data.message || 'Gagal generate token'
      }
    }

    return {
      success: true,
      token: data.data.token,
      links: data.data.links,
      generatedAt: data.data.generatedAt,
      source: data.source,
      attribution: data.attribution
    }

  } catch (error) {
    if (error.response?.status === 429) {
      return {
        success: false,
        error: 'Rate limit! Tunggu beberapa saat lagi.'
      }
    }
    return {
      success: false,
      error: error.response?.data?.message || error.message
    }
  }
}

// ===============================
// HANDLER BOT
// ===============================
let handler = async (m, { conn, text, usedPrefix, command }) => {
  await m.reply('⏳ *Generating NF Token...*\n\nMohon tunggu sebentar.')

  const result = await generateNftoken()

  if (!result.success) {
    return m.reply(`❌ *Gagal Generate Token*\n\n${result.error}`)
  }

  const { token, links, generatedAt, source, attribution } = result

  // Truncate token buat display (biar gak kepanjangan)
  const tokenShort = token.length > 50
    ? `${token.slice(0, 50)}...`
    : token

  let caption = `🎬 *NETFLIX NF TOKEN*\n`
  caption += `═══════════════════\n\n`
  caption += `📅 *Generated:* ${new Date(generatedAt).toLocaleString('id-ID')}\n`
  caption += `🌐 *Source:* ${source || 'Omegatech'}\n`
  caption += `👤 *Attribution:* ${attribution || '@Omegatech-01'}\n\n`

  caption += `🔑 *Token:*\n\`\`\`${tokenShort}\`\`\`\n\n`

  caption += `🔗 *Login Links:*\n\n`
  caption += `💻 *PC / Browser:*\n${links.pc}\n\n`
  caption += `📱 *Android:*\n${links.android}\n\n`
  caption += `📺 *TV (6 digit PIN):*\n${links.tv6}\n\n`
  caption += `📺 *TV (8 digit PIN):*\n${links.tv8}\n\n`

  caption += `📌 *Cara Pakai:*\n`
  caption += `1. Pilih link sesuai device kamu\n`
  caption += `2. Buka di browser / app Netflix\n`
  caption += `3. Otomatis login tanpa password\n\n`

  caption += `⚠️ *Token ini bersifat sementara.* Gunakan secepatnya!`

  return conn.sendMessage(m.chat, { text: caption }, { quoted: m })
}

// ===============================
// METADATA
// ===============================
handler.help = ['nftoken']
handler.tags = ['tools']
handler.command = /^(nftoken|nft|netflixtoken)$/i
handler.limit = true

export default handler