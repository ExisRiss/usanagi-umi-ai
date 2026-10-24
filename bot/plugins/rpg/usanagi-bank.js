
import { getUser, saveUser } from '../../lib/rpg/awang-db.js'
import { buildRpgContext } from '../../lib/rpg/awang-context.js'
import { rupiah } from '../../lib/rpg/awang-format.js'
import { sendRpgCard } from '../../lib/rpg/awang-ui.js'

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)
  const user = getUser(m.sender)

  if (typeof user.rpg.bank !== 'number') user.rpg.bank = 0

  const args = m.args || []
  const action = args[0]?.toLowerCase()
  const amountStr = args[1]

  if (action === 'deposit' || action === 'depo' || action === 'nabung') {
    const amount = amountStr === 'all' ? user.koin : parseInt(amountStr)

    if (!amount || amount <= 0) return m.reply(`Masukkan jumlah yang benar untuk deposit.`)
    if (user.koin < amount) return m.reply(`Uang cash kamu tidak cukup. Dompet: ${rupiah(user.koin)}.`)

    user.koin -= amount
    user.rpg.bank += amount
    saveUser(m.sender, user)

    return sendRpgCard(sock, m, { type: 'bank', headerTitle: 'RPG BANK', headerSubtitle: 'Deposit berhasil', data: { title: 'DEPOSIT COMPLETE', subtitle: 'Saldo tersimpan', result: 'Transaksi berhasil', victory: true, stats: [{ label: 'Deposit', value: `+${rupiah(amount)}`, color: '#3f9b73' }, { label: 'Bank', value: rupiah(user.rpg.bank), color: '#b88828' }, { label: 'Cash', value: rupiah(user.koin), color: '#4d8fae' }] }, body: `Deposit +${rupiah(amount)} · Saldo bank ${rupiah(user.rpg.bank)}` })
  }

  if (action === 'withdraw' || action === 'tarik') {
    const amount = amountStr === 'all' ? user.rpg.bank : parseInt(amountStr)

    if (!amount || amount <= 0) return m.reply(`Masukkan jumlah yang benar untuk tarik tunai.`)
    if (user.rpg.bank < amount) return m.reply(`Saldo tabungan tidak cukup. Saldo: ${rupiah(user.rpg.bank)}.`)

    user.rpg.bank -= amount
    user.koin += amount
    saveUser(m.sender, user)

    return sendRpgCard(sock, m, { type: 'bank', headerTitle: 'RPG BANK', headerSubtitle: 'Penarikan berhasil', data: { title: 'WITHDRAW COMPLETE', subtitle: 'Dana ditarik', result: 'Transaksi berhasil', victory: true, stats: [{ label: 'Withdraw', value: `+${rupiah(amount)}`, color: '#3f9b73' }, { label: 'Bank', value: rupiah(user.rpg.bank), color: '#b88828' }, { label: 'Cash', value: rupiah(user.koin), color: '#4d8fae' }] }, body: `Withdraw +${rupiah(amount)} · Cash ${rupiah(user.koin)}` })
  }

  let txt = `🏦 *Bank RPG*\n\n`
  txt += `💰 Uang Dompet: ${rupiah(user.koin)}\n`
  txt += `💳 Saldo Tabungan: ${rupiah(user.rpg.bank)}\n\n`
  txt += `Nabung: \`${m.prefix}bank deposit <jumlah>\`\n`
  txt += `Tarik: \`${m.prefix}bank withdraw <jumlah>\`\n\n`
  txt += `Pakai kata *all* untuk semuanya sekaligus.`

  await m.reply(txt)
}

handler.command = /^(bank|atm)$/i
handler.help = ['bank', 'atm']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Menyimpan uang di bank, aman dari rampokan'

export default handler
