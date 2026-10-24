
import fs from 'fs-extra'
import { ButtonV2 } from '../../lib/awang-tombol.js'

const rulesText = [
  '╭───〔 📜 PERATURAN BOT 〕',
  '│',
  '│ 1. Gunakan bot dengan bijak.',
  '│    Jangan mengirim spam atau',
  '│    permintaan berulang secara',
  '│    berlebihan.',
  '│',
  '│ 2. Dilarang menggunakan fitur',
  '│    untuk penipuan, tindakan ilegal,',
  '│    atau aktivitas yang merugikan',
  '│    orang lain.',
  '│',
  '│ 3. Hormati batas penggunaan setiap',
  '│    fitur. Jika suatu fitur sedang',
  '│    bermasalah, tunggu beberapa',
  '│    saat sebelum mencoba kembali.',
  '│',
  '│ 4. Jangan mencoba mengeksploitasi',
  '│    bug, membebani server, atau',
  '│    mengganggu stabilitas bot.',
  '│',
  '│ 5. Untuk fitur yang bekerja di group,',
  '│    ikuti aturan dan kebijakan group',
  '│    masing-masing.',
  '│',
  '│ 6. Jangan membagikan data pribadi',
  '│    atau informasi sensitif melalui',
  '│    bot maupun kepada pengguna lain.',
  '│',
  '│ 7. Beberapa fitur dapat berubah,',
  '│    dibatasi, atau dinonaktifkan',
  '│    sewaktu-waktu untuk pemeliharaan.',
  '│',
  '│ Dengan menggunakan Usanagi Umi AI, Anda',
  '│ dianggap telah memahami dan',
  '│ menyetujui peraturan penggunaan.',
  '│',
  '╰───────────────',
].join('\n')

const handler = async (m, { conn, usedPrefix }) => {
  const button = new ButtonV2(conn)
    .setBody(' ')
    .setFooter(rulesText)

  const thumbnailPath = './assets/image/rules.jpg'
  if (await fs.pathExists(thumbnailPath)) {
    button.setThumbnail(await fs.readFile(thumbnailPath))
  }

  button.addButton('⌂ MENU', `${usedPrefix}menu`)
  button.addButton('✧ DONASI', `${usedPrefix}donasi`)

  await button.send(m.chat, { quoted: m.raw })
}

handler.command = /^(peraturan|rules|aturan)$/i
handler.help = ['peraturan', 'rules', 'aturan']
handler.tags = ['main']
handler.description = 'Menampilkan peraturan penggunaan bot'
handler.category = 'main'
handler.hiddenFromCategory = false

export default handler
