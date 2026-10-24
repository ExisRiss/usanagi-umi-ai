/* Umi Usanagi AI — Paket Fitur Umi (kode orisinal) */

import { missionState } from '../rpg/umi-misi.js'

// Tebak angka 1-100. Satu sesi per pengguna per chat; progresnya mengisi
// misi harian .umimisi dan kemenangan membayar money RPG.

const sessions = new Map()
const MAX_TRIES = 7
const REWARD = 5000

let handler = async (m, { args, usedPrefix, command }) => {
  const key = `${m.chat}:${m.sender}`
  const user = global.db?.data?.users?.[m.sender]
  const guess = parseInt(args[0])
  const session = sessions.get(key)

  if (String(args[0]).toLowerCase() === 'stop') {
    if (!session) return m.reply('Tidak ada permainan berjalan.')
    sessions.delete(key)
    return m.reply(`Permainan dihentikan. Angkanya tadi *${session.number}*.`)
  }

  if (!session) {
    if (Number.isInteger(guess)) return m.reply(`Belum ada permainan. Mulai dulu: *${usedPrefix + command}*`)
    sessions.set(key, { number: 1 + Math.floor(Math.random() * 100), tries: 0 })
    if (user) missionState(user).plays = (missionState(user).plays || 0) + 1
    return m.reply(`🎲 *TEBAK ANGKA — Umi Usanagi AI*\n\nAku memilih angka *1–100*. Kamu punya ${MAX_TRIES} kesempatan.\nTebak dengan: ${usedPrefix + command} <angka>\nMenyerah: ${usedPrefix + command} stop\n\nMenang = +${REWARD.toLocaleString('id-ID')} money 🎁`)
  }

  if (!Number.isInteger(guess)) {
    return m.reply(`Tebak angkanya dengan: ${usedPrefix + command} <1-100> (sisa ${MAX_TRIES - session.tries} kesempatan)`)
  }
  if (guess < 1 || guess > 100) return m.reply('Angkanya antara 1 sampai 100 ya.')

  session.tries += 1

  if (guess === session.number) {
    sessions.delete(key)
    let rewardText = ''
    if (user) {
      const state = missionState(user)
      state.wins = (state.wins || 0) + 1
      user.money = (user.money || 0) + REWARD
      rewardText = `\n💰 +${REWARD.toLocaleString('id-ID')} money masuk dompetmu.`
    }
    return m.reply(`🎉 *BENAR!* Angkanya ${session.number}.\nKamu menang dalam ${session.tries} tebakan.${rewardText}\n\nCek misi: *.umimisi*`)
  }

  if (session.tries >= MAX_TRIES) {
    sessions.delete(key)
    return m.reply(`💥 Kesempatan habis! Angkanya *${session.number}*.\nMain lagi: *${usedPrefix + command}*`)
  }

  return m.reply(guess < session.number
    ? `📈 Lebih besar dari ${guess}. Sisa ${MAX_TRIES - session.tries} kesempatan.`
    : `📉 Lebih kecil dari ${guess}. Sisa ${MAX_TRIES - session.tries} kesempatan.`)
}

handler.help = ['umitebak', 'umitebak <angka>', 'umitebak stop']
handler.tags = ['game']
handler.category = 'game'
handler.command = /^(umitebak|tebakangkaumi)$/i
handler.description = 'Game tebak angka berhadiah money (Umi Usanagi AI)'

export default handler
// Diekspor untuk pengujian otomatis (tools/test-umi-pack.mjs).
export { sessions as tebakSessions }
