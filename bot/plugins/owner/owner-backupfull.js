/* By AlzRiss - Usanagi Umi AI */

const handler = async (m) => {
  if (typeof global.runFullBackup !== 'function') {
    throw new Error('Layanan backup otomatis belum siap.')
  }

  await m.reply('⏳ Membungkus seluruh data penting bot ke ZIP dan mengirimkannya ke group Telegram bot utama...')
  const result = await global.runFullBackup({ force: true, reason: 'manual-command' })

  if (result?.skipped) {
    return m.reply(`Backup tidak dijalankan: ${result.reason}`)
  }

  return m.reply(
    `✅ Backup selesai.\n` +
    `File: ${result.fileCount}\n` +
    `Bagian ZIP: ${result.parts?.length || 0}\n\n` +
    `By AlzRiss - Usanagi Umi AI`
  )
}

handler.help = ['backupfull']
handler.tags = ['owner']
handler.command = /^backupfull$/i
handler.owner = true
handler.description = 'Membuat dan mengirim backup penuh bot ke group Telegram bot utama'

export default handler
