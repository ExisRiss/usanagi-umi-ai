
import { requireFunTarget } from '../../lib/awang-fun.js'

const ratings = [
  { score: '10/10', comment: 'Sempurna! Nggak ada duanya!' },
  { score: '9/10', comment: 'Hampir sempurna! Keren banget!' },
  { score: '8/10', comment: 'Bagus banget! Mantap!' },
  { score: '7/10', comment: 'Cukup bagus, di atas rata-rata!' },
  { score: '6/10', comment: 'Lumayan, bisa lebih baik lagi.' },
  { score: '5/10', comment: 'Biasa aja sih, standar.' },
  { score: '4/10', comment: 'Hmm, kurang sedikit.' },
  { score: '3/10', comment: 'Perlu banyak perbaikan.' },
  { score: '2/10', comment: 'Aduh, masih jauh dari bagus.' },
  { score: '1/10', comment: 'Maaf, tapi ini parah.' },
  { score: '100/10', comment: 'LEGEND! Beyond perfect!' },
  { score: '11/10', comment: 'Melebihi ekspektasi!' },
  { score: '69/100', comment: 'Nice...' },
  { score: '420/10', comment: 'BLAZING!' },
  { score: '∞/10', comment: 'Gacor kang' },
  { score: '7.5/10', comment: 'Solid! Good job!' },
  { score: '8.5/10', comment: 'Impressive!' },
  { score: '9.5/10', comment: 'Near perfection!' },
  { score: '-1/10', comment: 'Aku nggak tau harus ngomong apa...' },
  { score: '???/10', comment: 'Error 404: Rating not found.' }
]

const handler = async (m) => {
  const target = await requireFunTarget(m)
  if (!target) return
  const text = target.display

  const rating = ratings[Math.floor(Math.random() * ratings.length)]
  await m.reply(
    `*RATE*\n\n` +
    `Target : ${text}\n` +
    `Nilai  : *${rating.score}*\n` +
    `Komentar : ${rating.comment}`,
    { mentions: target.mentions }
  )
}

handler.command = /^(rate|nilai|rating)$/i
handler.help = ['rate']
handler.tags = ['fun']
handler.description = 'Memberikan rating acak untuk sesuatu'

export default handler
