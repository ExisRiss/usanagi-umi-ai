let handler = async (m, { conn }) => {
  if (!db.data.chats[m.chat]) {
    db.data.chats[m.chat] = {}
  }

  const chat = db.data.chats[m.chat]
  const mode = chat.antilinkMode || 'off'

  let status = '⚪ Nonaktif'

  if (mode === 'soft') {
    status = '🟢 Anti Link'
  }

  if (mode === 'hard') {
    status = '🔴 Anti Link Hard'
  }

  await conn.sendMessage(
    m.chat,
    {
      text: `╭─「 *ANTI LINK GRUP* 」─
│
│ Status: ${status}
│
│ Pilih mode:
│
╰──────────────`,
      footer: global.brandCredit || 'By AlzRiss - Usanagi Umi AI',
      buttons: [
        {
          buttonId: 'antilink_soft',
          buttonText: {
            displayText: '🟢 Anti Link'
          },
          type: 1
        },
        {
          buttonId: 'antilink_hard',
          buttonText: {
            displayText: '🔴 Anti Link Hard'
          },
          type: 1
        },
        {
          buttonId: 'antilink_off',
          buttonText: {
            displayText: '⚪ Nonaktifkan'
          },
          type: 1
        }
      ],
      headerType: 1
    },
    {
      quoted: m
    }
  )
}

handler.before = async (m, { conn, isAdmin, isBotAdmin }) => {
  if (!m.isGroup) return

  if (!db.data.chats[m.chat]) {
    db.data.chats[m.chat] = {}
  }

  const chat = db.data.chats[m.chat]

  /*
   * =========================================================
   * BUTTON RESPONSE
   * =========================================================
   */

  const buttonId =
    m.selectedButtonId ||
    (m.message &&
      m.message.buttonsResponseMessage &&
      m.message.buttonsResponseMessage.selectedButtonId) ||
    (m.msg && m.msg.selectedButtonId)

  if (
    buttonId === 'antilink_soft' ||
    buttonId === 'antilink_hard' ||
    buttonId === 'antilink_off'
  ) {
    if (!isAdmin) {
      await m.reply(
        '❌ Hanya admin grup yang bisa mengubah Anti Link.'
      )
      return
    }

    if (buttonId === 'antilink_soft') {
      chat.antilink = true
      chat.antilinkMode = 'soft'

      await m.reply(
        '🟢 *Anti Link berhasil diaktifkan!*\n\n' +
        'Link grup akan otomatis dihapus.'
      )

      return
    }

    if (buttonId === 'antilink_hard') {
      chat.antilink = true
      chat.antilinkMode = 'hard'

      await m.reply(
        '🔴 *Anti Link Hard berhasil diaktifkan!*\n\n' +
        'Pengirim link grup akan otomatis dikeluarkan.'
      )

      return
    }

    if (buttonId === 'antilink_off') {
      chat.antilink = false
      chat.antilinkMode = 'off'

      await m.reply(
        '⚪ *Anti Link berhasil dinonaktifkan!*'
      )

      return
    }
  }

  /*
   * =========================================================
   * CEK STATUS
   * =========================================================
   */

  const mode = chat.antilinkMode || 'off'

  if (!chat.antilink) return
  if (mode === 'off') return

  /*
   * Bot harus admin
   */
  if (!isBotAdmin) return

  /*
   * Pesan harus punya text
   */
  if (!m.text) return

  /*
   * Admin tidak terkena Anti Link
   */
  if (isAdmin) return

  /*
   * =========================================================
   * DETEKSI LINK WHATSAPP
   * =========================================================
   */

  const linkRegex =
    /(https?:\/\/)?(chat\.whatsapp\.com\/|wa\.me\/chat)/i

  if (!linkRegex.test(m.text)) return

  try {
    /*
     * =======================================================
     * CEK LINK GRUP SENDIRI
     * =======================================================
     */

    let groupInvite

    try {
      groupInvite = await conn.groupInviteCode(m.chat)
    } catch {
      groupInvite = null
    }

    if (
      groupInvite &&
      m.text.includes(groupInvite)
    ) {
      return
    }

    /*
     * =======================================================
     * HAPUS PESAN
     * =======================================================
     */

    await conn.sendMessage(m.chat, {
      delete: {
        remoteJid: m.chat,
        fromMe: false,
        id: m.key.id,
        participant: m.sender
      }
    })

    /*
     * =======================================================
     * SOFT MODE
     * =======================================================
     */

    if (mode === 'soft') {
      await conn.sendMessage(
        m.chat,
        {
          text:
            `*– 乂 Anti Link Grup –*\n\n` +
            `Link grup WhatsApp tidak diperbolehkan di sini!`,
          mentions: [m.sender]
        },
        {
          quoted: m
        }
      )

      return
    }

    /*
     * =======================================================
     * HARD MODE
     * =======================================================
     */

    if (mode === 'hard') {
      await conn.sendMessage(
        m.chat,
        {
          text:
            `*– 乂 Anti Link Hard –*\n\n` +
            `@${m.sender.split('@')[0]} mengirim link grup WhatsApp.\n\n` +
            `🚫 Pesan dihapus\n` +
            `👢 Pengirim dikeluarkan`,
          mentions: [m.sender]
        },
        {
          quoted: m
        }
      )

      /*
       * Jangan kick bot sendiri
       */
      if (
        conn.user &&
        conn.user.id &&
        m.sender === conn.user.id
      ) {
        return
      }

      /*
       * =====================================================
       * KICK USER
       * =====================================================
       */

      await conn.groupParticipantsUpdate(
        m.chat,
        [m.sender],
        'remove'
      )
    }

  } catch (e) {
    console.error(
      '[ANTI LINK ERROR]',
      e
    )
  }
}

handler.help = ['antilink']
handler.tags = ['group']
handler.command = /^antilink$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler