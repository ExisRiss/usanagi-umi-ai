/* By AlzRiss - Usanagi Umi AI
 *
 * Task136 — deploy situs ke subdomain dari WhatsApp.
 *
 *   .deploysubdomain <nama>     → bot minta berkas (HTML / zip / tar.gz / kode HTML)
 *   .ceksubdomain [nama]        → status + daftar subdomain & pemiliknya
 *   .kontrol-subdomain <nama>   → tombol kontrol (deploy ulang, nonaktif, hapus)
 *   .subdomainmenu              → menu fitur subdomain
 *
 * Alamat hasil deploy:
 *   https://<nama>-alzriss.gwenna.my.id   (SSL siap — dipakai di semua pesan)
 *   https://<nama>.alzriss.gwenna.my.id   (didaftarkan juga; hidup setelah
 *                                          Total TLS/ACM aktif di Cloudflare)
 *
 * Kalau nama sudah dipakai orang lain → ditolak. Kalau dipakai user yang sama
 * → bot mengirim tombol: "biarkan file lama" atau "deploy ulang".
 */

import {
  bacaKonfig,
  subSiap,
  daftarSubdomain,
  infoSubdomain,
  deploySubdomain,
  hapusSubdomain,
  aturStatusSubdomain,
  namaSubAman,
  siapkanBerkas,
  hostUtama,
  hostTitik,
} from '../../lib/subdomain-kaira.js'
import { sendInteractive } from '../../lib/awang-tombol.js'

/* Menunggu berkas dari user: kunci `${chat}:${pengirim}` */
const TUNGGU = new Map()
const BATAS_TUNGGU = 10 * 60 * 1000

function kunci(m) {
  return `${m.chat}:${m.sender}`
}

function pasang(m, nama, mode = 'baru') {
  TUNGGU.set(kunci(m), { nama, mode, waktu: Date.now() })
}

function ambil(m) {
  const data = TUNGGU.get(kunci(m))
  if (!data) return null
  if (Date.now() - data.waktu > BATAS_TUNGGU) {
    TUNGGU.delete(kunci(m))
    return null
  }
  return data
}

function belumSiap() {
  return [
    '⚙️ *Fitur subdomain belum aktif di bot ini.*',
    '',
    'Berkas `data/subdomain-kaira.json` belum diisi (panelUrl, apiKey, serverId).',
  ].join('\n')
}

function rupiahBita(n) {
  const angka = Number(n || 0)
  if (angka >= 1024 * 1024) return `${(angka / 1024 / 1024).toFixed(2)} MB`
  if (angka >= 1024) return `${(angka / 1024).toFixed(1)} KB`
  return `${angka} B`
}

function waktuID(ms) {
  if (!ms) return '-'
  return new Date(ms).toLocaleString('id-ID', { timeZone: 'Asia/Makassar', dateStyle: 'medium', timeStyle: 'short' }) + ' WITA'
}

const namaPemilik = (info, m) => {
  const nomor = String(info?.pemilik || '').split('@')[0]
  const saya = String(m.sender || '').split('@')[0]
  if (!nomor) return 'tidak tercatat'
  return nomor === saya ? `${nomor} (kamu)` : `+${nomor}`
}

function kartuSub(item) {
  const aktif = !item.status || item.status === 'aktif'
  return [
    `🌐 *${item.nama}*`,
    `Status : ${aktif ? '🟢 aktif' : '🔴 ' + item.status}`,
    `Pemilik: ${item.pemilik ? '+' + String(item.pemilik).split('@')[0] : '-'}`,
    `Berkas : ${item.berkas || 0} · ${rupiahBita(item.ukuran)}`,
    `Deploy : ke-${item.deployKe || 1} · ${waktuID(item.diperbarui)}`,
    `URL    : https://${hostUtama(item.nama)}/`,
  ].join('\n')
}

async function kirimTombolKontrol(m, conn, item) {
  const aktif = !item.status || item.status === 'aktif'
  const isi = kartuSub(item)
  const rows = [
    { title: '🔄 Deploy ulang', description: 'Kirim berkas baru untuk subdomain ini', command: `.deploysubdomain ${item.nama} ganti` },
    { title: aktif ? '⏸️ Nonaktifkan' : '▶️ Aktifkan', description: aktif ? 'Situs ditutup sementara' : 'Situs dibuka kembali', command: aktif ? `.nonaktifsubdomain ${item.nama}` : `.aktifsubdomain ${item.nama}` },
    { title: '🗑️ Hapus subdomain', description: 'Folder + DNS dihapus permanen', command: `.hapussubdomain ${item.nama}` },
    { title: '📊 Info lengkap', description: 'Detail situs + waktu', command: `.ceksubdomain ${item.nama}` },
  ]
  try {
    return await sendInteractive(conn, m.chat, {
      title: `🌐 KONTROL ${item.nama.toUpperCase()}`,
      subtitle: `https://${hostUtama(item.nama)}/`,
      body: isi,
      footer: 'Pilih aksi di bawah.',
      list: { listTitle: 'Aksi subdomain', sections: [{ title: 'KONTROL', rows }] },
    }, { quoted: m.raw || m })
  } catch (error) {
    return m.reply([isi, '', 'Aksi:', ...rows.map((r) => `• ${r.title} → ${r.command}`)].join('\n'))
  }
}

let handler = async (m, extra = {}) => {
  const { conn, args = [], command = '', text = '' } = extra
  if (!subSiap()) return m.reply(belumSiap())

  if (command === 'subdomainmenu' || command === 'menu_subdomain') {
    const jumlah = (await daftarSubdomain().catch(() => [])).length
    return m.reply([
      '🌐 *SUB DOMAIN DEPLOY*',
      '',
      `Subdomain aktif: *${jumlah}*`,
      '',
      '*Perintah*',
      '.deploysubdomain <nama> — deploy situs ke <nama>-alzriss.gwenna.my.id',
      '.ceksubdomain — status + daftar subdomain & pemilik',
      '.ceksubdomain <nama> — detail satu subdomain',
      '.kontrol-subdomain <nama> — tombol kontrol (deploy ulang/nonaktif/hapus)',
      '.aktifsubdomain <nama> · .nonaktifsubdomain <nama>',
      '.hapussubdomain <nama>',
      '',
      '*Cara deploy*',
      '1. Ketik `.deploysubdomain nama`',
      '2. Balas dengan salah satu:',
      '   • berkas .html',
      '   • berkas .zip / .tar.gz (wajib ada index.html)',
      '   • kode HTML langsung di chat',
      '',
      `Contoh hasil: https://${hostUtama('contoh')}/`,
    ].join('\n'))
  }

  if (command === 'deploysubdomain' || command === 'deploysite') {
    const nama = namaSubAman(args[0] || '')
    const mode = /ganti|redeploy|ulang/i.test(String(args[1] || '')) ? 'ganti' : 'baru'
    if (!nama) {
      return m.reply([
        'Pakai: *.deploysubdomain <nama>*',
        '',
        'Aturan nama: 3–30 huruf kecil/angka/tanda hubung, tidak boleh angka saja.',
        `Hasil: https://<nama>-alzriss.gwenna.my.id`,
      ].join('\n'))
    }

    const info = await infoSubdomain(nama)
    if (info) {
      const pemilikSaya = String(info.pemilik || '').split('@')[0] === String(m.sender || '').split('@')[0]
      if (!pemilikSaya) {
        return m.reply(`❌ Subdomain *${nama}* sudah dipakai ${namaPemilik(info, m)}.\nCoba nama lain.`)
      }
      if (mode !== 'ganti') {
        /* Tanya dulu: file lama dibiarkan atau di-redeploy. */
        const isi = [kartuSub(info), '', 'Subdomain ini punyamu. Mau bagaimana?'].join('\n')
        try {
          return await sendInteractive(conn, m.chat, {
            title: '🌐 SUBDOMAIN SUDAH ADA',
            subtitle: `https://${hostUtama(nama)}/`,
            body: isi,
            footer: 'Pilih salah satu.',
            buttons: [
              { type: 'noop', label: '📦 Deploy ulang', command: `.deploysubdomain ${nama} ganti` },
              { type: 'noop', label: '✅ Biarkan file lama', command: `.kontrol-subdomain ${nama}` },
            ],
          }, { quoted: m.raw || m })
        } catch (error) {
          return m.reply([isi, '', `• Deploy ulang → .deploysubdomain ${nama} ganti`, `• Biarkan file lama → .ceksubdomain ${nama}`].join('\n'))
        }
      }
    }

    pasang(m, nama, mode)
    return m.reply([
      `🌐 Siap deploy ke *${hostUtama(nama)}*`,
      '',
      'Sekarang *balas pesan ini* dengan salah satu:',
      '• berkas *.html*',
      '• berkas *.zip* / *.tar.gz* (ada index.html di akar)',
      '• atau tempel kode HTML langsung',
      '',
      `⏳ Menunggu maksimal 10 menit. Batal: .bataldeploy`,
    ].join('\n'))
  }

  if (command === 'bataldeploy') {
    TUNGGU.delete(kunci(m))
    return m.reply('✅ Deploy dibatalkan.')
  }

  if (command === 'ceksubdomain' || command === 'listubdomain' || command === 'statussubdomain') {
    const target = args[0] ? namaSubAman(args[0]) : ''
    if (target) {
      const info = await infoSubdomain(target)
      if (!info) return m.reply(`Subdomain *${target}* belum terdaftar.`)
      return m.reply([
        kartuSub({ nama: target, ...info }),
        '',
        `URL cadangan: https://${hostTitik(target)}/`,
        `DNS: CNAME → tunnel`,
      ].join('\n'))
    }
    const daftar = await daftarSubdomain()
    if (!daftar.length) {
      return m.reply(['🌐 *Belum ada subdomain yang dipakai.*', '', 'Deploy pertama: *.deploysubdomain <nama>*'].join('\n'))
    }
    const baris = daftar.map((x, i) => {
      const aktif = !x.status || x.status === 'aktif'
      return `${i + 1}. *${x.nama}* ${aktif ? '🟢' : '🔴'} — +${String(x.pemilik || '-').split('@')[0]} · ${x.berkas || 0} berkas`
    })
    return m.reply([
      `🌐 *Subdomain terpakai* (${daftar.length})`,
      '',
      ...baris,
      '',
      'Detail: .ceksubdomain <nama>',
    ].join('\n'))
  }

  if (command === 'kontrol-subdomain' || command === 'kontrolsubdomain') {
    const nama = namaSubAman(args[0] || '')
    if (!nama) {
      const daftar = await daftarSubdomain()
      if (!daftar.length) return m.reply('Belum ada subdomain. Pakai .deploysubdomain <nama>')
      return m.reply(['Pakai: .kontrol-subdomain <nama>', '', 'Milikmu:', ...daftar.filter((x) => String(x.pemilik || '').split('@')[0] === String(m.sender || '').split('@')[0]).map((x) => `• ${x.nama}`)].join('\n'))
    }
    const info = await infoSubdomain(nama)
    if (!info) return m.reply(`Subdomain *${nama}* belum terdaftar.`)
    const pemilikSaya = String(info.pemilik || '').split('@')[0] === String(m.sender || '').split('@')[0]
    if (!pemilikSaya && !extra.isOwner && !extra.isROwner) {
      return m.reply(`❌ Subdomain ini milik ${namaPemilik(info, m)}.`)
    }
    return kirimTombolKontrol(m, conn, { nama, ...info })
  }

  if (command === 'aktifsubdomain' || command === 'nonaktifsubdomain') {
    const nama = namaSubAman(args[0] || '')
    if (!nama) return m.reply(`Pakai: .${command} <nama>`)
    const info = await infoSubdomain(nama)
    if (!info) return m.reply(`Subdomain *${nama}* belum terdaftar.`)
    const pemilikSaya = String(info.pemilik || '').split('@')[0] === String(m.sender || '').split('@')[0]
    if (!pemilikSaya && !extra.isOwner && !extra.isROwner) return m.reply('❌ Bukan subdomainmu.')
    const hasil = await aturStatusSubdomain(nama, command === 'aktifsubdomain' ? 'aktif' : 'nonaktif')
    return m.reply(hasil.status === 'aktif'
      ? `▶️ *${nama}* diaktifkan lagi: https://${hostUtama(nama)}/`
      : `⏸️ *${nama}* dinonaktifkan. Situs menampilkan pesan "sedang nonaktif".`)
  }

  if (command === 'hapussubdomain' || command === 'delsubdomain') {
    const nama = namaSubAman(args[0] || '')
    if (!nama) return m.reply('Pakai: .hapussubdomain <nama>')
    const info = await infoSubdomain(nama)
    if (!info) return m.reply(`Subdomain *${nama}* belum terdaftar.`)
    const pemilikSaya = String(info.pemilik || '').split('@')[0] === String(m.sender || '').split('@')[0]
    if (!pemilikSaya && !extra.isOwner && !extra.isROwner) return m.reply('❌ Bukan subdomainmu.')
    if (!/hapus|yes|ya/i.test(String(args[1] || ''))) {
      return m.reply(`⚠️ Hapus *${nama}* permanen?\nKetik: *.hapussubdomain ${nama} hapus*`)
    }
    const hasil = await hapusSubdomain(nama)
    return m.reply(`🗑️ Subdomain *${hasil.nama}* dihapus beserta berkas & DNS-nya.`)
  }
}

/* Menangkap balasan berkas / kode HTML selama menunggu deploy. */
handler.all = async function (m) {
  const tunggu = ambil(m)
  if (!tunggu) return
  const conn = this
  const teks = String(m.text || '')
  const adaDokumen = Boolean(m.mimetype || m.msg?.documentMessage || m.quoted?.mimetype)

  if (!adaDokumen && !/<[a-z!/]/i.test(teks)) return

  TUNGGU.delete(kunci(m))
  await m.reply(`⏳ Mengunggah ke *${hostUtama(tunggu.nama)}*...`)

  let buffer = null
  let namaBerkas = ''
  if (adaDokumen) {
    const sumber = m.mimetype ? m : m.quoted
    try { buffer = await sumber.download() } catch (error) { }
    if (!buffer && typeof conn.downloadMediaMessage === 'function') {
      try { buffer = await conn.downloadMediaMessage(sumber) } catch (error) { }
    }
    namaBerkas = String(sumber?.filename || sumber?.msg?.fileName || '')
  }

  try {
    const berkas = siapkanBerkas(buffer, namaBerkas, adaDokumen ? '' : teks)
    const hasil = await deploySubdomain({
      nama: tunggu.nama,
      berkas,
      pemilik: String(m.sender || ''),
      judul: String(m.pushName || '').slice(0, 40),
      mode: tunggu.mode,
    })
    return m.reply([
      '✅ *DEPLOY BERHASIL*',
      '',
      `🌐 ${hasil.url}`,
      `📦 ${hasil.berkas} berkas · ${rupiahBita(hasil.ukuran)}`,
      `🔁 Deploy ke-${hasil.info.deployKe}`,
      '',
      'Catatan: DNS butuh ±10–30 detik. Kalau belum terbuka, tunggu lalu muat ulang.',
      `Kontrol: .kontrol-subdomain ${hasil.nama}`,
    ].join('\n'))
  } catch (error) {
    TUNGGU.set(kunci(m), tunggu)
    return m.reply(`❌ Deploy gagal: ${error?.message || error}\n\nCoba kirim ulang berkasnya (maks 10 menit).`)
  }
}

handler.help = ['deploysubdomain nama', 'ceksubdomain', 'kontrol-subdomain nama', 'subdomainmenu']
handler.tags = ['owner']
handler.command = /^(deploysubdomain|deploysite|ceksubdomain|listubdomain|statussubdomain|kontrol-?subdomain|kontrolsubdomain|aktifsubdomain|nonaktifsubdomain|hapussubdomain|delsubdomain|bataldeploy|subdomainmenu|menu_subdomain)$/i
handler.description = 'Deploy situs ke subdomain <nama>-alzriss.gwenna.my.id dari WhatsApp'
handler.owner = false
handler.group = false
handler.private = false

export { handler, TUNGGU }
export default handler
