let handler = async (m) => {
  console.log(
    JSON.stringify(m.message, null, 2)
  )

  m.reply('Pesan berhasil dilog ke console.')
}

handler.command = /^cekswgc$/i

export default handler