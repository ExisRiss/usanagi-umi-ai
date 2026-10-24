import axios from 'axios'

const HEADERS = {
  accept: '*/*',
  'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
  'cache-control': 'no-cache',
  pragma: 'no-cache',
  'sec-ch-ua':
    '"Mises";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
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

let handler = async (m, { text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(
      `*Contoh penggunaan:*\n${usedPrefix + command} https://bit.ly/xxxxx`
    )
  }

  await m.react?.('⏳')

  try {
    const result = await bypassLink(text.trim())

    if (!result) throw 'Tidak ada respon dari server.'

    let msg = `乂 *BYPASS LINK*\n\n`

    for (const [key, value] of Object.entries(result)) {
      msg += `◦ *${key}* : ${
        typeof value === 'object'
          ? `\`\`\`${JSON.stringify(value, null, 2)}\`\`\``
          : value
      }\n`
    }

    await m.react?.('✅')
    m.reply(msg.trim())
  } catch (e) {
    await m.react?.('❌')
    m.reply(
      `Gagal melakukan bypass.\n\n${
        e?.response?.data
          ? JSON.stringify(e.response.data, null, 2)
          : e.message || e
      }`
    )
  }
}

handler.help = ['bypass <url>']
handler.tags = ['tools']
handler.command = ['bypass', 'bypasslink', 'unlocklink']

export default handler