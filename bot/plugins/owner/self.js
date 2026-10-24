
import { saveJadibotConfig } from '../../lib/bot-config.js'

let handler = async (m, { command, conn }) => {
  const profile = conn?.botConfig

  if (profile?.type === 'jadibot') {
    const nextPublic = command === 'public'
    if (profile.public === nextPublic) {
      return m.reply(`Bot sudah mode ${nextPublic ? 'PUBLIC' : 'SELF'}`)
    }
    profile.public = nextPublic
    saveJadibotConfig(profile)
    return m.reply(nextPublic
      ? '✅ Bot masuk mode PUBLIC dan dapat dipakai semua orang.'
      : '✅ Bot masuk mode SELF. Hanya owner bot, developer terkunci, dan bot sendiri yang dapat memakai command.')
  }

  if (!global.db.data.settings) global.db.data.settings = {}
  if (!global.db.data.settings[m.conn.user.jid]) global.db.data.settings[m.conn.user.jid] = { public: true }
  const settings = global.db.data.settings[m.conn.user.jid]

  if (command === 'self') {
    if (!settings.public) return m.reply('Bot sudah mode SELF')
    settings.public = false
    // Simpan juga ke setting bot utama supaya halaman Setting Bot Utama
    // menampilkan mode yang sama dengan perintah WhatsApp ini.
    try {
      const { applyMainBotSettingsInput } = await import('../../lib/main-bot-settings.js')
      await applyMainBotSettingsInput({ mode: 'self' }, { actor: 'whatsapp-self' })
    } catch {}
    return m.reply('✅ Bot masuk mode SELF')
  }

  if (settings.public) return m.reply('Bot sudah mode PUBLIC')
  settings.public = true
  try {
    const { applyMainBotSettingsInput } = await import('../../lib/main-bot-settings.js')
    await applyMainBotSettingsInput({ mode: 'public' }, { actor: 'whatsapp-self' })
  } catch {}
  return m.reply('✅ Bot masuk mode PUBLIC')
}

handler.help = ['self', 'public']
handler.tags = ['owner']
handler.command = /^(self|public)$/i
handler.owner = true
// settings.public berlaku global untuk semua sesi.
handler.platformOnly = true

export default handler
