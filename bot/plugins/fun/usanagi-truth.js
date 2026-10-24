/* By AlzRiss - Usanagi Umi AI */

const localTruth = [
  'Acara tv apa yang paling memuakkan? Berikan alasannya!',
  'Apa baju yang (menurutmu) paling jelek yang pernah kamu pakai, dan kapan kamu memakainya?',
  'Apa binatang patronus yang cocok untuk kamu?',
  'Apa hal paling buruk yang pernah kamu bilang tentang temenmu?',
  'Apa hal paling memalukan dari dirimu?',
  'Apa kebohongan terbesar yang pernah kamu katakan?',
  'Apa ketakutan terbesar kamu?',
  'Apa makanan yang paling kamu benci?',
  'Apa rahasia yang tidak pernah kamu ceritakan ke siapa pun?',
  'Apa yang akan kamu lakukan jika kamu bisa invisible selama sehari?',
  'Ceritakan tentang crush pertama kamu.',
  'Hal paling aneh yang pernah kamu lakukan di depan umum?',
  'Siapa orang yang paling kamu kagumi dan kenapa?',
  'Pernah bohong ke orangtua? Ceritakan.',
  'Apa mimpi teraneh yang pernah kamu alami?'
]

const handler = async (m) => {
  let question = localTruth[Math.floor(Math.random() * localTruth.length)]

  try {
    const res = await fetch('https://raw.githubusercontent.com/BochilTeam/database/master/kata-kata/truth.json')
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data) && data.length) {
        question = data[Math.floor(Math.random() * data.length)]
      }
    }
  } catch {}

  await m.reply(
    `*TRUTH*\n\n` +
    `${question}`
  )
}

handler.command = /^(truth)$/i
handler.help = ['truth']
handler.tags = ['fun']
handler.description = 'Mendapatkan pertanyaan truth acak'

export default handler
