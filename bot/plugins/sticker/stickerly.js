import axios from 'axios'

const baseURL = 'https://api.sticker.ly/v4'
if (!global.stickerlySession) global.stickerlySession = {}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args.length) {
    return m.reply(
      `Contoh:\n` +
      `${usedPrefix + command} blue archive`
    )
  }

  const query = args.join(' ')
  try {
    const { data } = await axios.post(
      `${baseURL}/stickerPack/smartSearch`,
      {
        keyword: query,
        enabledKeywordSearch: true,
        filter: {
          extendSearchResult: false,
          sortBy: 'RECOMMENDED',
          languages: ['ALL'],
          minStickerCount: 5,
          searchBy: 'ALL',
          stickerType: 'ALL',
        },
      },
      {
        headers: {
          'user-agent': 'androidapp.stickerly/3.17.0',
          'content-type': 'application/json',
        },
      }
    )

    const packs = data?.result?.stickerPacks || []
    if (!packs.length) return m.reply('Tidak ada pack ditemukan.')

    global.stickerlySession[m.sender] = packs.slice(0, 10)

    let teks = `*StickerLy Search: ${query}*\n\n`
    packs.slice(0, 10).forEach((p, i) => {
      teks += `${i + 1}. ${p.name}\n`
      teks += `Stiker: ${p.resourceFiles.length}\n\n`
    })
    teks += `Ketik angka 1-10 untuk pilih`

    m.reply(teks)

  } catch (e) {
    console.log(e)
    m.reply('Gagal mencari pack.')
  }
}

handler.before = async function (m, { conn }) {
  if (!/^(10|[1-9])$/.test(m.text)) return

  const session = global.stickerlySession?.[m.sender]
  if (!session) return

  const pack = session[Number(m.text) - 1]
  if (!pack) return m.reply('Nomor tidak valid.')

  delete global.stickerlySession[m.sender]

  m.reply(`Mengirim *${pack.name}*...`)

  try {
    let match = pack.shareUrl.match(/\/s\/([^\/\?#]+)/)
    if (!match) return m.reply('URL error.')

    let { data } = await axios.get(
      `${baseURL}/stickerPack/${match[1]}?needRelation=true`,
      {
        headers: {
          'user-agent': 'androidapp.stickerly/3.17.0',
          'content-type': 'application/json',
        },
      }
    )

    let stickers = data.result.stickers || []
    let prefix = data.result.resourceUrlPrefix

    if (!stickers.length) return m.reply('Kosong.')

    let limit = stickers.slice(0, 30)

    let stickerList = limit.map(s => ({
      data: { url: prefix + s.fileName }
    }))

    await conn.sendMessage(m.chat, {
      cover: { url: prefix + limit[0].fileName },
      stickers: stickerList,
      name: pack.name,
      publisher: global.brandCredit || 'By AlzRiss - Usanagi Umi AI',
      description: 'AlzRiss ᴍᴅ ʙy AlzRiss'
    }, { quoted: m })

  } catch (e) {
    console.log(e)
    m.reply('Gagal ambil.')
  }
}

handler.help = ['stickerly']
handler.tags = ['sticker']
handler.command = /^(stly|stickerly)$/i
handler.limit = true

export default handler