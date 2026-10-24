
import { getAllOwnerEntries } from '../../lib/awang-cekakses.js'

function escapeVCard(value) {
  return String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, ' ')
}

const handler = async (m, { conn }) => {
  const owners = getAllOwnerEntries(conn)
  const contacts = owners.map(({ number, name }) => ({
    vcard: [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${escapeVCard(name)}`,
      `TEL;type=CELL;type=VOICE;waid=${number}:+${number}`,
      'END:VCARD',
    ].join('\n'),
  }))

  if (!contacts.length) {
    await conn.sendMessage(m.chat, { text: 'Belum ada owner yang terdaftar.' }, { quoted: m.raw })
    return
  }

  await conn.sendMessage(
    m.chat,
    {
      contacts: {
        displayName: `Owner (${contacts.length})`,
        contacts,
      },
    },
    { quoted: m.raw }
  )
}

handler.command = /^owner$/i
handler.help = ['owner']
handler.tags = ['owner']
handler.description = 'Menampilkan seluruh kontak owner bot'
handler.ownerOnly = false

export default handler
