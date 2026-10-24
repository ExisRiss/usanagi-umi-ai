
const localDare = [
  'Kirim chat "Aku sayang kamu" ke contact terakhir di list kamu.',
  'Nyanyi lagu favorit kamu di voice note selama 30 detik.',
  'Kirim foto muka kamu sekarang ke grup.',
  'Ceritakan lelucon paling jelek yang kamu tahu.',
  'Tulis status WA "Aku lagi main dare" selama 1 jam.',
  'Minta maaf ke orang yang terakhir kamu ributin (kalau ada).',
  'Kirim emoji random sebanyak 20 ke chat ini.',
  'Tebak umur admin grup tanpa bertanya.',
  'Buat pantun tentang bot ini.',
  'Katakan 3 kelebihan orang di sebelah kamu (tag orangnya).',
  'Post story "Aku sedang menjalani dare dari bot".',
  'Ganti foto profil jadi meme selama 10 menit.',
  'Kirim voice note bilang "Halo dunia" dengan aksen lucu.',
  'Tulis 5 kata yang menggambarkan dirimu.',
  'Tag 3 orang dan bilang "Kamu keren!"'
]

const handler = async (m) => {
  let challenge = localDare[Math.floor(Math.random() * localDare.length)]

  try {
    const res = await fetch('https://raw.githubusercontent.com/BochilTeam/database/master/kata-kata/dare.json')
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data) && data.length) {
        challenge = data[Math.floor(Math.random() * data.length)]
      }
    }
  } catch {}

  await m.reply(
    `*DARE*\n\n` +
    `${challenge}`
  )
}

handler.command = /^(dare|tantang)$/i
handler.help = ['dare']
handler.tags = ['fun']
handler.description = 'Mendapatkan tantangan dare acak'

export default handler
