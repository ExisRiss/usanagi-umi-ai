/**
 * Name : Sticker Telegram Search
 * Type : ESM
 * Url : https://www.sigstick.com
  * By AlzRiss - Usanagi Umi AI
 */
import axios from 'axios'

const baseURL = 'https://www.sigstick.com'

if (!global.sigstickSession) {
  global.sigstickSession = {}
}

const headers = {
  'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
  accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
}

const axiosInstance = axios.create({
  timeout: 20000,
  headers
})

// ============================================================
// BUILD ID
// ============================================================
let cachedBuildId = null
let cachedBuildTime = 0

async function getBuildId() {
  if (cachedBuildId && Date.now() - cachedBuildTime < 15 * 60 * 1000) {
    return cachedBuildId
  }

  const { data: html } = await axiosInstance.get(`${baseURL}/stickers`)
  
  let match = html.match(/"buildId":"([a-zA-Z0-9_-]+)"/)
  if (!match?.[1]) {
    match = html.match(/data-build-id="([a-zA-Z0-9_-]+)"/)
  }
  
  if (!match?.[1]) {
    throw new Error('Build ID tidak ditemukan.')
  }
  
  cachedBuildId = match[1]
  cachedBuildTime = Date.now()
  
  return cachedBuildId
}

// ============================================================
// SEARCH
// ============================================================
async function searchPack(keyword) {
  const buildId = await getBuildId()
  const url = `${baseURL}/_next/data/${buildId}/stickers.json`
  
  const { data } = await axiosInstance.get(url, {
    params: { keyword },
    headers: {
      ...headers,
      'x-nextjs-data': '1',
      referer: `${baseURL}/stickers?keyword=${encodeURIComponent(keyword)}`
    }
  })
  
  return data?.pageProps?.packs || []
}

// ============================================================
// GET PACK PAGE
// ============================================================
async function getPack(pack) {
  let url = ''
  
  if (pack.id) {
    url = `${baseURL}/pack/${pack.id}`
  } else if (pack.url) {
    url = pack.url
  }
  
  if (!url) {
    throw new Error('URL pack tidak ditemukan.')
  }

  const { data: html } = await axiosInstance.get(url)

  // Cari URL sticker dari HTML SigStick
  // Contoh format: https://cdn2.cdnstep.com/xxxx/0.thumb128.webp
  const regex = /https?:\/\/cdn2\.cdnstep\.com\/[^"'\\\s<>]+/g
  let urls = html.match(regex) || []
  
  urls = urls
    .map(url => {
      return url
        .replace(/\\u0026/g, '&')
        .replace(/\\u002F/g, '/')
        .replace(/\\\//g, '/')
    })
    .filter(url => /\.(webp|png|jpg|jpeg)(\?.*)?$/i.test(url))
    
  // SigStick biasanya menampilkan thumbnail. Hilangkan duplikat URL.
  urls = [...new Set(urls)]

  if (!urls.length) {
    throw new Error('URL sticker tidak ditemukan pada pack.')
  }

  return { url, stickers: urls }
}

// ============================================================
// HANDLER SEARCH
// ============================================================
let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args.length) {
    return m.reply(
      `🔎 *Sticker Search*\n\nContoh:\n${usedPrefix + command} usanagi\n${usedPrefix + command} blue archive`
    )
  }

  const query = args.join(' ')

  try {
    await m.reply(`🔎 Mencari sticker pack *${query}*...`)
    const packs = await searchPack(query)
    
    if (!packs.length) {
      return m.reply(`❌ Tidak ada sticker pack untuk *${query}*.`)
    }

    const results = packs.slice(0, 10)
    
    // Session per sender
    global.sigstickSession[m.sender] = results
    
    let teks = `╭─「 *SIGSTICK SEARCH* 」\n` +
               `│ 🔎 Query: *${query}*\n` +
               `│ 📦 Total: *${packs.length}*\n` +
               `╰────────────────\n\n`
               
    results.forEach((p, i) => {
      teks += `*${i + 1}. ${p.title || 'Tanpa Judul'}*\n`
      if (p.status) teks += ` Status: ${p.status}\n`
      if (p.id) teks += ` ID: ${p.id}\n`
      if (p.telegramUrl) teks += ` Telegram: ${p.telegramUrl}\n`
      teks += '\n'
    })
    
    teks += `Reply angka *1-${results.length}* untuk mengirim pack.`
    await m.reply(teks)
    
  } catch (e) {
    console.error('[SIGSTICK SEARCH]', e)
    await m.reply(`❌ Gagal mencari sticker pack.\n\n${e.message}`)
  }
}

// ============================================================
// REPLY NUMBER
// ============================================================
handler.before = async function (m, { conn }) {
  if (!m.text) return
  
  // Support 1 sampai 10
  if (!/^(10|[1-9])$/.test(m.text.trim())) return

  const session = global.sigstickSession?.[m.sender]
  if (!session) return

  const number = Number(m.text.trim())
  const pack = session[number - 1]
  
  if (!pack) {
    return m.reply('❌ Nomor sticker pack tidak valid.')
  }

  delete global.sigstickSession[m.sender]
  await m.reply(`📦 Mengambil pack *${pack.title || 'Sticker Pack'}*...`)

  try {
    const result = await getPack(pack)
    let stickers = result.stickers || []
    
    if (!stickers.length) {
      return m.reply('❌ Sticker dalam pack tidak ditemukan.')
    }

    // WhatsApp native sticker pack.
    // Batasi jumlah agar ukuran paket tidak terlalu berat.
    const limit = stickers.slice(0, 30)
    const stickerList = limit.map(url => ({ data: { url } }))
    
    // Perbaikan: limit[0] sudah berupa string URL, jadi tidak perlu .url
    const cover = limit[0]
    
    if (!cover) {
      return m.reply('❌ Cover sticker tidak ditemukan.')
    }

    await conn.sendMessage(
      m.chat, 
      {
        cover: { url: cover },
        stickers: stickerList,
        name: pack.title || 'SigStick Pack',
        publisher: global.brandCredit || 'By AlzRiss - Usanagi Umi AI',
        description: 'AlzRiss ᴍᴅ ʙy AlzRiss'
      }, 
      { quoted: m }
    )
    
  } catch (e) {
    console.error('[SIGSTICK PACK]', e)
    await m.reply(`❌ Gagal mengambil sticker pack.\n\n${e.message}`)
  }
}


// ============================================================
// COMMAND
// ============================================================
handler.help = ['stickersearch <keyword>']
handler.tags = ['sticker']
handler.command = /^(stickersearch|stickerfind|sigstick)$/i
handler.limit = true

export default handler