import axios from 'axios'

let handler = async (m, { conn, args }) => {
  const sadNumber = parseInt(args[0] || '', 10)

  if (isNaN(sadNumber) || sadNumber < 1 || sadNumber > 34) {
    throw 'Masukkan nomor antara 1 dan 34\nContoh: .sad 2'
  }

  const sadQuotes = [
    '🥀 Kadang yang paling menyakitkan adalah berpura-pura baik-baik saja.',
    '🌧️ Tidak semua luka terlihat, tidak semua tangis terdengar.',
    '💔 Beberapa orang hadir hanya untuk menjadi kenangan.',
    '🕊️ Aku belajar melepaskan meski hati belum siap.',
    '🌙 Malam selalu tahu apa yang gagal disembunyikan senyum.',
    '🍂 Yang pergi belum tentu salah, yang bertahan belum tentu bahagia.',
    '🎭 Tersenyum bukan berarti tidak terluka.',
    '☔ Hujan mengajarkan bahwa tidak semua yang jatuh akan kembali.',
    '🫀 Ada rindu yang memilih diam daripada mengganggu.',
    '🌑 Kadang menghilang lebih mudah daripada menjelaskan perasaan.',
    '🍃 Kenangan tidak pernah benar-benar pergi.',
    '🌊 Yang tenggelam bukan tubuhku, melainkan harapanku.',
    '🖤 Beberapa luka hanya bisa disimpan, bukan diceritakan.',
    '✨ Aku baik-baik saja, kata kebohongan yang paling sering diucapkan.',
    '🌹 Cinta yang tulus kadang berakhir dengan perpisahan.'
  ]

  const randomQuote =
    sadQuotes[Math.floor(Math.random() * sadQuotes.length)]

  const audioUrl = `https://github.com/Rangelofficial/Sad-Music/raw/main/audio-sad/sad${sadNumber}.mp3`

  const res = await fetch(audioUrl)
  if (!res.ok) throw 'Gagal mengunduh audio.'

  const audioBuffer = Buffer.from(await res.arrayBuffer())

  const thumbUrl = 'https://files.catbox.moe/y5b7l6.jpg'
  const thumb = (
    await axios.get(thumbUrl, {
      responseType: 'arraybuffer'
    })
  ).data

  await conn.sendMessage(
    m.chat,
    {
      text: `${global.links?.websiteUrl || global.scriptUrl || ''}/${'\u2063'.repeat(500)}

🎧 *Sad Music #${sadNumber}*

${randomQuote}`,
      linkPreview: {
        'matched-text': global.links?.websiteUrl || global.scriptUrl || '',
        title: '🎧 Sad Music',
        description: randomQuote,
        previewType: 0,
        jpegThumbnail: thumb
      }
    },
    { quoted: m }
  )

  await conn.sendMessage(
    m.chat,
    {
      audio: audioBuffer,
      mimetype: 'audio/mpeg',
      ptt: false
    },
    { quoted: m }
  )
}

handler.help = ['sad <nomor>']
handler.tags = ['sound']
handler.command = /^sad$/i
handler.limit = true

export default handler