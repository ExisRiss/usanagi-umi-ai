
import { settings } from '../../config/settings.js'
import { sendInteractive } from '../../lib/awang-tombol.js'
import { getMenuStyle, setMenuStyle } from '../../core/awang-menu-config.js'
import { getSelectableMenuLabel, buildMenuStyleSections } from '../../lib/awang-menu.js'

function getMenuLabel(style) {
  return getSelectableMenuLabel(style)
}

async function showMenuSelector(m, conn, usedPrefix, activeStyle) {
  const sections = buildMenuStyleSections(usedPrefix, activeStyle)

  await sendInteractive(
    conn,
    m.chat,
    {
      title: `${settings.botName} · Set Menu`,
      subtitle: 'Pengaturan tampilan menu utama',
      body: `Tampilan aktif: ${getMenuLabel(activeStyle)}\nPilih tampilan yang ingin digunakan.`,
      footer: 'Satu tampilan aktif pada satu waktu.',
      list: {
        listTitle: 'Pilih Tampilan',
        sections,
      },
    },
    { quoted: m.raw }
  )
}

const handler = async (m, { conn, usedPrefix }) => {
  const requested = String(m.args[0] || '').trim().toLowerCase()
  const activeStyle = getMenuStyle()

  if (!requested) {
    await showMenuSelector(m, conn, usedPrefix, activeStyle)
    return
  }

  const allowed = requested === 'default' || requested === 'modern'
  if (!allowed) {
    await m.reply(`Pilihan menu tidak valid. Gunakan ${usedPrefix}setmenu untuk membuka daftar tampilan.`)
    return
  }

  try {
    const savedStyle = setMenuStyle(requested)
    await m.reply(
      `✅ Menu berhasil diubah.\n\n` +
      `Tampilan aktif: *${getMenuLabel(savedStyle)}*`
    )
  } catch (error) {
    await m.reply(`❌ Menu gagal diubah.\n\n${error?.message || 'Penyimpanan setting gagal.'}`)
  }
}

handler.command = /^setmenu$/i
handler.help = ['setmenu']
handler.tags = ['owner']
handler.category = 'owner'
handler.description = 'Mengatur tampilan menu utama bot'
handler.ownerOnly = true
handler.groupOnly = false
handler.disabled = false
handler.hiddenFromCategory = false

export default handler
