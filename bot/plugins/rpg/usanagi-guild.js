
import { getUser, saveUser, getGuild, saveGuild, deleteGuild, getAllGuilds, findGuildByName } from '../../lib/rpg/awang-db.js'
import { buildRpgContext } from '../../lib/rpg/awang-context.js'
import { rupiah } from '../../lib/rpg/awang-format.js'
import { sendRpgCard } from '../../lib/rpg/awang-ui.js'

const CREATE_COST = 10000

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)
  const user = getUser(m.sender)
  const args = m.args || []
  const action = args[0]?.toLowerCase()
  const guildName = args.slice(1).join(' ')

  if (!action || !['create', 'join', 'leave', 'info', 'list', 'members', 'deposit'].includes(action)) {
    let txt = `🏰 *Sistem Guild*\n\n`
    txt += `\`${m.prefix}guild create <nama>\`\n\`${m.prefix}guild join <nama>\`\n\`${m.prefix}guild leave\`\n`
    txt += `\`${m.prefix}guild info\`\n\`${m.prefix}guild members\`\n\`${m.prefix}guild deposit <jumlah>\`\n\`${m.prefix}guild list\`\n\n`

    if (user.rpg.guildId) {
      const myGuild = getGuild(user.rpg.guildId)
      txt += `📌 Status: Tergabung di *${myGuild?.name || 'Unknown'}*`
    } else {
      txt += `📌 Status: Belum tergabung guild manapun`
    }
    return m.reply(txt)
  }

  if (action === 'list') {
    const guildList = getAllGuilds()
    if (guildList.length === 0) {
      return m.reply(`Belum ada guild. Buat dengan \`${m.prefix}guild create <nama>\`.`)
    }

    let txt = `🏆 *Daftar Guild*\n\n`
    for (const g of guildList.slice(0, 10)) {
      txt += `🏰 ${g.name} (Lv.${g.level})\n👥 ${g.members.length}/50 | 💰 ${rupiah(g.treasury)}\n\n`
    }
    return m.reply(txt)
  }

  if (action === 'create') {
    if (user.rpg.guildId) return m.reply(`Kamu sudah punya guild. Keluar dulu untuk buat yang baru.`)
    if (!guildName || guildName.length < 3) return m.reply(`Nama guild minimal 3 karakter.`)
    if (guildName.length > 20) return m.reply(`Nama guild maksimal 20 karakter.`)

    if (findGuildByName(guildName)) {
      return m.reply(`Nama *${guildName}* sudah dipakai guild lain.`)
    }

    if (user.koin < CREATE_COST) {
      return m.reply(`Butuh ${rupiah(CREATE_COST)} untuk mendirikan guild.`)
    }

    user.koin -= CREATE_COST
    const guildId = `guild_${Date.now()}`

    saveGuild(guildId, {
      id: guildId,
      name: guildName,
      leader: m.sender,
      members: [m.sender],
      treasury: 0,
      level: 1,
      exp: 0,
      createdAt: Date.now(),
    })

    user.rpg.guildId = guildId
    saveUser(m.sender, user)

    return sendRpgCard(sock, m, { type: 'guild', headerTitle: 'GUILD', headerSubtitle: guildName, data: { title: 'GUILD CREATED', subtitle: guildName, result: 'Guild baru berhasil didirikan', victory: true, stats: [{ label: 'Level', value: '1', color: '#b9a6f2' }, { label: 'Cost', value: `-${rupiah(CREATE_COST)}`, color: '#e0c17b' }, { label: 'Members', value: '1/50', color: '#9bd8ea' }] }, body: `${guildName} · Guild berdiri · Biaya -${rupiah(CREATE_COST)}`, mentions: [m.sender] })
  }

  if (action === 'join') {
    if (user.rpg.guildId) return m.reply(`Kamu sudah tergabung di guild lain.`)
    if (!guildName) return m.reply(`Contoh: \`${m.prefix}guild join DragonSlayers\``)

    const targetGuild = findGuildByName(guildName)
    if (!targetGuild) return m.reply(`Guild *${guildName}* tidak ditemukan.`)
    if (targetGuild.members.length >= 50) return m.reply(`Guild *${targetGuild.name}* sudah penuh (50/50).`)

    targetGuild.members.push(m.sender)
    saveGuild(targetGuild.id, targetGuild)

    user.rpg.guildId = targetGuild.id
    saveUser(m.sender, user)

    return m.reply(`✅ Kamu bergabung dengan guild *${targetGuild.name}*.`)
  }

  if (action === 'leave') {
    if (!user.rpg.guildId) return m.reply(`Kamu belum tergabung guild manapun.`)

    const myGuild = getGuild(user.rpg.guildId)
    if (!myGuild) {
      user.rpg.guildId = null
      saveUser(m.sender, user)
      return m.reply(`Guild kamu sudah tidak ada. Status direset.`)
    }

    if (myGuild.leader === m.sender && myGuild.members.length > 1) {
      return m.reply(`Sebagai ketua, kamu tidak bisa keluar selagi masih ada anggota lain.`)
    }

    myGuild.members = myGuild.members.filter((jid) => jid !== m.sender)

    if (myGuild.members.length === 0) {
      deleteGuild(myGuild.id)
    } else {
      saveGuild(myGuild.id, myGuild)
    }

    const leftName = myGuild.name
    user.rpg.guildId = null
    saveUser(m.sender, user)

    return m.reply(`🏃 Kamu keluar dari guild *${leftName}*.`)
  }

  if (action === 'info') {
    if (!user.rpg.guildId) return m.reply(`Kamu belum punya guild.`)

    const myGuild = getGuild(user.rpg.guildId)
    if (!myGuild) return m.reply(`Guild tidak ditemukan.`)

    let txt = `🏰 *${myGuild.name}*\n\n`
    txt += `👑 Ketua: @${myGuild.leader.split('@')[0]}\n`
    txt += `📊 Level: ${myGuild.level}\n`
    txt += `👥 Anggota: ${myGuild.members.length}/50\n`
    txt += `💰 Kas: ${rupiah(myGuild.treasury)}`

    return sendRpgCard(sock, m, { type: 'guild', headerTitle: 'GUILD', headerSubtitle: myGuild.name, data: { title: myGuild.name, subtitle: 'Guild information', result: `Level ${myGuild.level} · ${myGuild.members.length}/50 members`, victory: true, stats: [{ label: 'Level', value: String(myGuild.level), color: '#b9a6f2' }, { label: 'Members', value: `${myGuild.members.length}/50`, color: '#9bd8ea' }, { label: 'Treasury', value: rupiah(myGuild.treasury), color: '#e0c17b' }] }, body: `Leader @${myGuild.leader.split('@')[0]} · Level ${myGuild.level} · ${myGuild.members.length}/50 · Kas ${rupiah(myGuild.treasury)}`, mentions: [myGuild.leader] })
  }

  if (action === 'members') {
    if (!user.rpg.guildId) return m.reply(`Kamu belum punya guild.`)

    const myGuild = getGuild(user.rpg.guildId)
    if (!myGuild) return m.reply(`Guild tidak ditemukan.`)

    const memberList = myGuild.members
      .map((jid, i) => `${i + 1}. @${jid.split('@')[0]}${jid === myGuild.leader ? ' 👑' : ''}`)
      .join('\n')

    return m.reply(`👥 *Anggota ${myGuild.name}*\n\n${memberList}`, { mentions: myGuild.members })
  }

  if (action === 'deposit') {
    if (!user.rpg.guildId) return m.reply(`Kamu belum punya guild.`)

    const myGuild = getGuild(user.rpg.guildId)
    if (!myGuild) return m.reply(`Guild tidak ditemukan.`)

    const amount = parseInt(args[1]) || 0
    if (amount < 100) return m.reply(`Donasi minimal Rp 100.`)
    if (user.koin < amount) return m.reply(`Koin kamu tidak cukup.`)

    user.koin -= amount
    myGuild.treasury += amount
    saveGuild(myGuild.id, myGuild)
    saveUser(m.sender, user)

    return sendRpgCard(sock, m, { type: 'guild', headerTitle: 'GUILD', headerSubtitle: myGuild.name, data: { title: 'DONATION COMPLETE', subtitle: myGuild.name, result: `+${rupiah(amount)} treasury`, victory: true, stats: [{ label: 'Donation', value: `+${rupiah(amount)}`, color: '#98d2b0' }, { label: 'Treasury', value: rupiah(myGuild.treasury), color: '#e0c17b' }] }, body: `Donasi +${rupiah(amount)} · Kas ${rupiah(myGuild.treasury)}` })
  }
}

handler.command = /^guild$/i
handler.help = ['guild', 'clan', 'team', 'kelompok']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Sistem guild/clan'

export default handler
