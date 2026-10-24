import axios from 'axios'

const HEADERS = {
  accept: '*/*',
  'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
  'cache-control': 'no-cache',
  pragma: 'no-cache',
  'sec-ch-ua': '"Mises";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
  'sec-ch-ua-mobile': '?1',
  'sec-ch-ua-platform': '"Android"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-origin',
  Referer: 'https://bypass-links.com/'
}

async function getToken() {
  const { data } = await axios.get(
    'https://bypass-links.com/api/token',
    {
      headers: HEADERS
    }
  )

  if (!data?.token) throw 'Gagal mendapatkan bypass token.'

  return data.token
}

async function bypassLink(url) {
  const bypass_token = await getToken()

  const { data } = await axios.post(
    'https://bypass-links.com/api/bypass',
    {
      url,
      bypass_token
    },
    {
      headers: {
        ...HEADERS,
        'content-type': 'application/json'
      }
    }
  )

  return data
}

let handler = async (m, { text }) => {
  if (!text) {
    throw `Masukkan URL yang ingin dibypass.

Contoh:
.bypass https://linkvertise.com/xxxx`
  }

  await m.reply('⏳ Sedang membypass link...')

  try {
    const res = await bypassLink(text.trim())

    if (!res) throw 'Tidak ada respon dari server.'

    let hasil = `乂 *BYPASS LINK*\n\n`
    hasil += `🔗 *Input:*\n${text.trim()}\n\n`

    if (res.result)
      hasil += `✅ *Result:*\n${res.result}\n\n`

    if (res.url)
      hasil += `🌐 *URL:*\n${res.url}\n\n`

    if (res.destination)
      hasil += `🎯 *Destination:*\n${res.destination}\n\n`

    if (res.message)
      hasil += `💬 *Message:*\n${res.message}\n\n`

    hasil += '```'
    hasil += JSON.stringify(res, null, 2)
    hasil += '```'

    m.reply(hasil)
  } catch (e) {
    console.error(e)

    m.reply(
      `❌ Gagal membypass link.\n\n${
        e?.response?.data
          ? JSON.stringify(e.response.data, null, 2)
          : e.message || e
      }`
    )
  }
}

handler.help = ['bypass2 <url>']
handler.tags = ['tools']
handler.command = ['bypass2', 'bypasslink2']

export default handler