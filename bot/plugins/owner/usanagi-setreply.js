/* By AlzRiss - Usanagi Umi AI */

import { settings } from '../../config/settings.js'
import { sendInteractive } from '../../lib/awang-tombol.js'
import { getReplyVariant, replyVariants, setReplyVariant } from '../../lib/awang-reply.js'

const handler = async (m, { conn }) => {
  const value = (m.text || '').trim().toLowerCase()

  if (value) {
    const normalized = value.startsWith('v') ? value : `v${value}`
    const variant = Number(normalized.slice(1))
    const selected = replyVariants[variant]

    if (!selected) {
      await m.reply('Pilihan tidak valid. Gunakan V1, V2, V3, V4, atau V5.')
      return
    }

    await setReplyVariant(variant)
    await m.reply(
      `Reply style diperbarui.\n\n` +
      `Aktif  : V${variant} — ${selected.name}\n` +
      `Format : ${selected.desc}`
    )
    return
  }

  const current = await getReplyVariant()
  const active = replyVariants[current] || replyVariants[1]
  const rows = Object.entries(replyVariants).map(([key, item]) => ({
    title: `┌─ V${key}  ·  ${item.name}${Number(key) === current ? '  ·  aktif' : ''}`,
    description: `└─ ${item.desc}`,
    command: `${settings.defaultPrefix}setreply v${key}`,
  }))

  await sendInteractive(
    conn,
    m.chat,
    {
      title: '*Usanagi Umi AI  ·  Reply Style*',
      subtitle: 'Panel format balasan',
      body: '\u200e',
      footer: `╭─ *Reply Style*\n│ Aktif  ·  V${current}  ·  ${active.name}\n│ Pilih  ·  V1  ·  V2  ·  V3  ·  V4  ·  V5\n│\n╰─ *Terapkan gaya balasan otomatis*`,
      list: {
        listTitle: 'Pilih Style',
        sections: [{ title: 'REPLY  ·  01—05', rows }],
      },
      image: 'reply-style-menu.svg',
    },
    { quoted: m.raw }
  )

}

handler.command = /^setreply$/i
handler.help = ['setreply']
handler.tags = ['owner']
handler.category = 'owner'
handler.description = 'Mengatur variant reply'
handler.ownerOnly = true
handler.groupOnly = false
handler.disabled = false
handler.hiddenFromCategory = false

export default handler
