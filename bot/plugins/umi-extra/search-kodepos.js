/* By AlzRiss - Usanagi Umi AI */
/*
╔══════════════════════════════════════════════╗
║        ⚡  𝑨𝑳𝒁𝑹𝑰𝑺𝑺 𝑴𝑫  ⚡                     ║
╚══════════════════════════════════════════════╝

╭───────────「 ✦ 𝑰𝑵𝑭𝑶 𝑨𝑳𝒁𝑹𝑰𝑺𝑺 ✦ 」───────────╮
│ 👤 Developer : 𝑨𝒍𝒛𝑹𝒊𝒔𝒔
│ 📢 Saluran   : https://whatsapp.com/channel/0029VbDBOXH11ulIKHVbmO0m
│ ⚙️ Engine    : Baileys Multi-Device
╰──────────────────────────────────────────────╯

              「 ⚡ 𝑨𝑳𝒁𝑹𝑰𝑺𝑺 𝑴𝑫 ⚡ 」
*/

export const FEATURE_CREDIT = 'By AlzRiss - Usanagi Umi AI';


// Search kode pos 
// source Scrape https://whatsapp.com/channel/0029VbDBOXH11ulIKHVbmO0m

class KodePosScraper {
  constructor() {
    this.baseUrl = 'https://kodepos.co.id/data'
    this.endpoints = {
      provinsi: '/provinsi.json',
      kota: '/kota.json',
      kecamatan: '/kecamatan.json',
      kelurahan: '/kelurahan.json'
    }
  }

  async fetchData(endpoint) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`)
      if (!response.ok) throw new Error()
      return await response.json()
    } catch {
      return []
    }
  }

  async search(query) {
    if (!query || typeof query !== 'string' || query.length < 3) {
      return { message: 'Query minimal 3 karakter', data: [] }
    }

    const keyword = query.toLowerCase()

    const [provinsiData, kotaData, kecamatanData, kelurahanData] = await Promise.all([
      this.fetchData(this.endpoints.provinsi),
      this.fetchData(this.endpoints.kota),
      this.fetchData(this.endpoints.kecamatan),
      this.fetchData(this.endpoints.kelurahan)
    ])

    const matches = kelurahanData.filter(item =>
      item.nama.toLowerCase().includes(keyword) ||
      item.kode_pos.toString().includes(keyword) ||
      item.kecamatan_nama.toLowerCase().includes(keyword) ||
      item.kota_nama.toLowerCase().includes(keyword) ||
      item.provinsi_nama.toLowerCase().includes(keyword)
    )

    if (matches.length === 0) {
      return { message: 'Data tidak ditemukan', data: [] }
    }

    const formatted = matches.map(kel => {
      const kec = kecamatanData.find(k => k.nama === kel.kecamatan_nama && k.kota_nama === kel.kota_nama)
      const kot = kotaData.find(c => c.nama === kel.kota_nama && c.provinsi_nama === kel.provinsi_nama)
      const prov = provinsiData.find(p => p.nama === kel.provinsi_nama)

      return {
        kodePos: kel.kode_pos,
        kelurahan: {
          nama: kel.nama,
          kemendagri: kel.kode_kemendagri,
          lat: kel.lat,
          lng: kel.lng,
          elevasi: kel.elevasi
        },
        kecamatan: kec ? {
          nama: kec.nama,
          kemendagri: kec.kode_kemendagri,
          zona: kec.zona_waktu
        } : null,
        kota: kot ? {
          nama: kot.nama,
          kemendagri: kot.kode_kemendagri,
          lat: kot.lat,
          lng: kot.lng
        } : null,
        provinsi: prov ? {
          nama: prov.nama,
          kemendagri: prov.kode_kemendagri,
          zona: prov.zona_waktu
        } : null
      }
    })

    return {
      total: formatted.length,
      query: query,
      results: formatted
    }
  }
}

const scraper = new KodePosScraper()

const pluginConfig = {
  name: "kodepos",
  alias: [],
  category: "search",
  description: "Imported from Usanagi Umi AI V4.6",
  usage: "",
  example: "",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock, text }) {
    const conn = sock;
  if (!text) {
    return conn.reply(
      m.chat,
      'Masukkan query pencarian.\nContoh: .kodepos Jakarta Barat',
      m,
      { quoted: global.fkontak }
    )
  }

  await conn.reply(m.chat, 'Mencari data kode pos...', m, { quoted: global.fkontak })

  const hasil = await scraper.search(text)

  if (hasil.data?.length === 0 || hasil.results?.length === 0) {
    return conn.reply(m.chat, 'Data tidak ditemukan.', m, { quoted: global.fkontak })
  }

  let teks = `Hasil pencarian: ${hasil.query}\nTotal: ${hasil.total}\n\n`

  hasil.results.slice(0, 10).forEach((r, i) => {
    teks += `${i + 1}. Kode Pos: ${r.kodePos}\n`
    teks += `Kelurahan: ${r.kelurahan.nama}\n`
    teks += `Kecamatan: ${r.kecamatan?.nama || '-'}\n`
    teks += `Kota: ${r.kota?.nama || '-'}\n`
    teks += `Provinsi: ${r.provinsi?.nama || '-'}\n\n`
  })

  await conn.reply(m.chat, teks.trim(), m, { quoted: global.fkontak })
}

/* Compatibility adapter — By AlzRiss - Usanagi Umi AI */
const __umiCommands = ["kodepos"]
const __umiOriginalHandler = handler
const __umiHandler = async function (m, context = {}) {
  const adapted = Object.create(m)
  Object.defineProperties(adapted, {
    text: { value: String(context.text || ''), writable: true, configurable: true },
    args: { value: context.args || [], writable: true, configurable: true },
    command: { value: String(context.command || '').toLowerCase(), writable: true, configurable: true },
    prefix: { value: context.usedPrefix || '.', writable: true, configurable: true },
    isOwner: { value: Boolean(context.isOwner), writable: true, configurable: true },
    isPremium: { value: Boolean(context.isPrems), writable: true, configurable: true },
    isAdmin: { value: Boolean(context.isAdmin), writable: true, configurable: true },
    isBotAdmin: { value: Boolean(context.isBotAdmin), writable: true, configurable: true }
  })
  return __umiOriginalHandler.call(this, adapted, {
    ...context,
    sock: context.conn,
    conn: context.conn,
    text: String(context.text || ''),
    query: String(context.text || ''),
    args: context.args || [],
    command: String(context.command || '').toLowerCase(),
    prefix: context.usedPrefix || '.',
    usedPrefix: context.usedPrefix || '.',
    db: global.db
  })
}
__umiHandler.help = ["kodepos"]
__umiHandler.tags = ["search"]
__umiHandler.command = new RegExp(`^(${__umiCommands.map(value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})$`, 'i')
__umiHandler.owner = false
__umiHandler.premium = false
__umiHandler.group = false
__umiHandler.private = false
__umiHandler.admin = false
__umiHandler.botAdmin = false
__umiHandler.limit = false
__umiHandler.source = 'Usanagi Umi AI feature collection'
export default __umiHandler
