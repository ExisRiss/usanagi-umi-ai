
import { pluginStore } from '../../core/awang-loader.js'
import { sendNativeRichTable } from '../../lib/awang-table.js'

const handler = async (m, { conn }) => {
  try {
    const plugins = [...pluginStore.values()]
    const categories = new Map()
    let total = 0
    let enabled = 0

    for (const plugin of plugins) {
      if (typeof plugin !== 'function') continue

      const category = String(plugin.category || 'umum')
        .trim()
        .toUpperCase() || 'UMUM'

      const current = categories.get(category) || {
        total: 0,
        enabled: 0,
      }

      current.total++
      total++

      if (plugin.disabled !== true) {
        current.enabled++
        enabled++
      }

      categories.set(category, current)
    }

    const sorted = [...categories.entries()]
      .sort((a, b) => {
        const totalDiff = b[1].total - a[1].total
        return totalDiff || a[0].localeCompare(b[0])
      })

    const tableData = sorted.map(([category, data]) => {
      const percentage = total
        ? ((data.total / total) * 100).toFixed(1)
        : '0.0'

      return [
        category,
        String(data.total),
        `${percentage}%`,
      ]
    })

    const reactionKey = m?.raw?.key || m?.key

    if (reactionKey) {
      await conn.sendMessage(
        m.chat,
        {
          react: {
            text: '📊',
            key: reactionKey,
          },
        },
      ).catch(() => {})
    }

    await sendNativeRichTable(
      conn,
      m.chat,
      'Distribusi Fitur',
      ['Kategori', 'Jumlah', 'Persentase'],
      tableData,
      m.raw,
      {
        headerText: `Total: ${total} · Aktif: ${enabled} · Kategori: ${sorted.length}`,
        footer: `Total ${total} fitur terdaftar`,
      },
    )
  } catch (error) {
    const reactionKey = m?.raw?.key || m?.key

    if (reactionKey) {
      await conn.sendMessage(
        m.chat,
        {
          react: {
            text: '⚠️',
            key: reactionKey,
          },
        },
      ).catch(() => {})
    }

    await m.reply(
      `╭─「 USANAGI • TOTAL FITUR 」\n` +
      `│\n` +
      `│ Tidak dapat menampilkan distribusi fitur.\n` +
      `│\n` +
      `│ ${error?.message || 'Terjadi kesalahan yang tidak diketahui.'}\n` +
      `╰────────────────────╯`
    )
  }
}

handler.command = /^(totalfitur|totalfeature|totalcmd|countplugin|distribusi)$/i
handler.help = [
  'totalfitur',
  'totalfeature',
  'totalcmd',
  'countplugin',
  'distribusi',
]
handler.tags = ['main']
handler.category = 'main'
handler.description = 'Lihat total fitur dan distribusi kategori bot'

export default handler
