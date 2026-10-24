
import { getAllUsers } from '../../lib/rpg/awang-db.js'
import { buildRpgContext } from '../../lib/rpg/awang-context.js'
import { rupiah, number } from '../../lib/rpg/awang-format.js'
import { sendRpgCard } from '../../lib/rpg/awang-ui.js'

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)
  const type = (m.args?.[0] || 'level').toLowerCase()
  const users = getAllUsers()
  const config = {
    level: { label: '⭐ Level', value: (u) => u.level, format: number },
    exp: { label: '✨ EXP', value: (u) => u.exp, format: number },
    koin: { label: '💰 Koin', value: (u) => u.koin, format: rupiah },
  }[type]
  if (!config) return m.reply(`Gunakan: ${m.prefix}leaderboard [level|exp|koin]`)
  const top = users.sort((a,b) => config.value(b) - config.value(a)).slice(0, 10)
  if (!top.length) return m.reply(`Belum ada data pemain RPG.`)
  const players = top.map((u) => ({
    name: `@${String(u.jid).split('@')[0]}`,
    value: config.format(config.value(u)),
  }))
  return sendRpgCard(sock, m, {
    type: 'leaderboard',
    headerTitle: 'LEADERBOARD',
    headerSubtitle: 'Top pemain RPG',
    data: {
      title: 'RPG RANKING',
      category: config.label.replace(/^[^\p{L}\p{N}]+/u, ''),
      players,
    },
    body: `Kategori ${config.label.replace(/^[^\p{L}\p{N}]+/u, '')}. Menampilkan ${top.length} pemain teratas.`,
    mentions: top.map((u) => String(u.jid).includes('@') ? u.jid : `${u.jid}@s.whatsapp.net`),
  })
}

handler.command = /^(leaderboard|toprpg|rpgleader)$/i
handler.help = ['leaderboard']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Peringkat pemain RPG'

export default handler
