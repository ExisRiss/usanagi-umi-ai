/* By AlzRiss - Usanagi Umi AI */

const quotes = [
  'Kadang kita terlalu sibuk mencari yang hilang, sampai lupa mensyukuri yang ada.',
  'Hati yang patah butuh waktu, bukan orang baru.',
  'Tidak semua yang pergi itu pergi selamanya, ada yang hanya butuh jarak.',
  'Lebih baik sendiri daripada bersama orang yang membuatmu merasa sendiri.',
  'Senyummu bisa jadi topeng, tapi air matamu tidak pernah bohong.',
  'Kadang yang paling menyakitkan bukan perpisahan, tapi harapan yang terus digantung.',
  'Belajarlah melepaskan, karena tidak semua yang kita sayang harus kita miliki.',
  'Waktu tidak menyembuhkan, ia hanya membuat kita terbiasa.',
  'Lebih baik sakit karena kebenaran daripada bahagia karena kebohongan.',
  'Jangan biarkan rasa sakit masa lalu merusak kebahagiaan masa depan.'
]

const handler = async (m) => {
  const q = quotes[Math.floor(Math.random() * quotes.length)]
  await m.reply(
    `*QUOTE SAD*\n\n` +
    `"${q}"`
  )
}

handler.command = /^(quotesad|sadboy|quotesadboy)$/i
handler.help = ['quotesad']
handler.tags = ['fun']
handler.description = 'Random quote sedih / sadboy'

export default handler
