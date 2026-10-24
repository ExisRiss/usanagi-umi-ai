let handler = m => m

const PREFIX = '.'

const getText = m => {
  return (
    m.text ||
    m.caption ||
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    ''
  )
}

const normalizeJid = jid => {
  if (!jid) return ''
  return String(jid).split('@')[0].split(':')[0]
}

const normalizeCmd = v => {
  return String(v || '').toLowerCase().trim()
}

const getTarget = (m, text) => {
  if (m.mentionedJid?.length) return m.mentionedJid[0]
  if (m.quoted?.sender) return m.quoted.sender

  let number = text.replace(/[^0-9]/g, '')
  if (number.length < 8) return null

  return number + '@s.whatsapp.net'
}

// Map fallback jika pola kalimat tidak terdeteksi
const commandMap = {
  download: 'ytmp3', dl: 'ytmp3', donlot: 'ytmp3',
  s: 'sticker', stiker: 'sticker', stik: 'sticker',
  help: 'menu', list: 'menu', daftar: 'menu'
}

const detectDownloadCommand = (rawCmd, q, fallbackCmd) => {
  if (!/^(download|dl|donlot|unduh)$/i.test(rawCmd)) return fallbackCmd
  if (/tiktok\.com|vt\.tiktok\.com/i.test(q)) return 'tiktok'
  if (/youtu\.be|youtube\.com/i.test(q)) return 'ytmp3'
  return fallbackCmd
}

const skipPlugin = name => /daftar|register|verify|verif|reg/i.test(name)

const getPluginHelps = plugin => {
  if (!plugin?.help) return []
  let helps = Array.isArray(plugin.help) ? plugin.help : [plugin.help]
  return helps.filter(v => typeof v === 'string').map(v => normalizeCmd(v.split(' ')[0]))
}

const getPluginCommands = plugin => {
  if (!plugin?.command) return []
  if (typeof plugin.command === 'string') return [normalizeCmd(plugin.command)]
  if (Array.isArray(plugin.command)) {
    return plugin.command.filter(v => typeof v === 'string').map(v => normalizeCmd(v))
  }
  return []
}

const isAcceptCommand = (plugin, command) => {
  command = normalizeCmd(command)
  if (getPluginHelps(plugin).includes(command)) return true
  if (getPluginCommands(plugin).includes(command)) return true
  return false
}

const findPlugin = command => {
  command = normalizeCmd(command)
  for (let name in global.plugins) {
    let plugin = global.plugins[name]
    if (!plugin || plugin.disabled || typeof plugin !== 'function' || skipPlugin(name)) continue
    if (isAcceptCommand(plugin, command)) return { name, plugin }
  }
  return null
}

handler.before = async function (m, extra) {
  let {
    conn, isAdmin, isOwner, isBotAdmin, isROwner, isPrems,
    participants, groupMetadata, user, bot, isRAdmin, match,
    chatUpdate, __dirname, __filename
  } = extra

  let text = getText(m)
  if (!text || m.fromMe) return

  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
  let chat = global.db.data.chats[m.chat]

  if (!chat.autogpt || chat.isBanned) return
  if (!/^usanagi[\s,]+/i.test(text)) return

  // 1. Bersihkan prefix "usanagi" dan ambil input utamanya
  let input = text.replace(/^usanagi[\s,]+/i, '').trim()
  if (!input) return

  let lower = input.toLowerCase()

  // ================= KICK / ADD MEMBER =================
  let isKick = /(kick|kik|keluarin|keluarkan|tendang|remove)/i.test(lower)
  let isAdd = /(add|tambah|tambahkan|masukin|invite|undang)/i.test(lower)

  if ((isKick || isAdd) && (m.mentionedJid?.length || m.quoted || /628\d+/.test(lower))) {
    if (!m.isGroup) return m.reply('Ini cuma bisa di grup ehehe~')
    if (!isAdmin && !isOwner) return m.reply('Hweh, cuma admin/owner yang boleh 🥹')
    if (!isBotAdmin) return m.reply('AlzRiss belum admin 😭')

    let target = getTarget(m, input)
    if (!target) return m.reply(`Tandai atau balas pesannya ya!\nContoh: AlzRiss keluarkan @user`)
    if (normalizeJid(target) === normalizeJid(conn.user.jid)) return m.reply('Masa AlzRiss disuruh keluar sendiri 🫠')

    try {
      if (isKick) {
        await conn.groupParticipantsUpdate(m.chat, [target], 'remove')
        return m.reply('Sudah AlzRiss keluarkan 🤗')
      }
      if (isAdd) {
        await conn.groupParticipantsUpdate(m.chat, [target], 'add')
        return m.reply('Sudah AlzRiss tambahkan 🤗')
      }
    } catch (e) {
      return m.reply('Gagal, mungkin privasi target aktif 🥹')
    }
  }

  // ================= BUKA / TUTUP GRUP =================
  let isOpenGroup = /(buka|open)(.*?)(grup|gc)/i.test(lower)
  let isCloseGroup = /(tutup|close)(.*?)(grup|gc)/i.test(lower)

  if (isOpenGroup || isCloseGroup) {
    if (!m.isGroup) return m.reply('Ini cuma bisa di grup ehehe~')
    if (!isAdmin && !isOwner) return m.reply('Hweh, cuma admin/owner yang boleh 🔐')
    if (!isBotAdmin) return m.reply('AlzRiss belum admin 🔐')

    try {
      if (isOpenGroup) {
        await conn.groupSettingUpdate(m.chat, 'not_announcement')
        return m.reply('Waku waku~ Grup berhasil dibuka 🔓')
      }
      if (isCloseGroup) {
        await conn.groupSettingUpdate(m.chat, 'announcement')
        return m.reply('Hehe~ Grup berhasil ditutup 🔒')
      }
    } catch (e) {
      return m.reply('Hweh... gagal buka/tutup grup 🥀')
    }
  }

  // ================= COMMAND ROUTER (NLP LITE) =================
  // 2. Hapus kata-kata imbuhan/filler yang sering dipakai user
  let fillers = /^(tolong|coba|bantu|dong|bikinin|carikan|cariin|buatkan|coba|search|cari|lihat|tampilkan|kasih)\s+/i
  let cleanInput = input.replace(fillers, '').trim()

  let cmd = ''
  let q = ''

  // 3. Regex Intent Matching (Tangkap makna kalimat)
  const patterns = [
    // ALLMENU harus di atas MENU agar tidak bertabrakan
    { cmd: 'allmenu', regex: /^(semua menu|menu semua|allmenu|all menu|list all)\s*(.*)/i },
    { cmd: 'menu', regex: /^(menu|help|daftar|list)\s*(.*)/i },
    
    { cmd: 'play', regex: /^(putar|mainkan|lagu|musik|music|play)\s*(.*)/i },
    { cmd: 'ytmp3', regex: /^(download lagu|dl lagu|unduh lagu|mp3|audio)\s*(.*)/i },
    { cmd: 'ytmp4', regex: /^(download video|dl video|unduh video|mp4|video)\s*(.*)/i },
    { cmd: 'tiktok', regex: /^(download tiktok|dl tt|unduh tiktok|tiktok|tt)\s*(.*)/i },
    { cmd: 'sticker', regex: /^(buat stiker|bikin stiker|stiker|sticker|stik|s)\s*(.*)/i },
    { cmd: 'gimage', regex: /^(cari gambar|carikan gambar|gambar|image|foto)\s*(.*)/i },
    { cmd: 'pinterest', regex: /^(pinterest|pin)\s*(.*)/i },
    { cmd: 'google', regex: /^(google|googling)\s*(.*)/i }
  ]

  let matched = false
  for (let p of patterns) {
    let matchArr = cleanInput.match(p.regex)
    if (matchArr) {
      cmd = p.cmd
      q = matchArr[2].trim() // Sisa kalimat dijadikan query
      matched = true
      break
    }
  }

  // 4. Fallback jika tidak kena pola regex di atas (sistem kata pertama as usual)
  if (!matched) {
    let split = cleanInput.split(/\s+/)
    let rawCmd = normalizeCmd(split.shift())
    q = split.join(' ')
    cmd = commandMap[rawCmd] || rawCmd
    cmd = detectDownloadCommand(rawCmd, q, cmd)
  }

  let found = findPlugin(cmd)
  if (!found) return // Abaikan jika AlzRiss tidak menemukan command yang sesuai

  let { name, plugin } = found

  try {
    console.log(`[ALZRISS CMD] Intent: ${cmd} | Query: ${q} | Plugin: ${name}`)

    let fakeM = Object.create(m)
    let args = q ? q.split(/\s+/) : []

    Object.defineProperty(fakeM, 'text', {
      value: PREFIX + cmd + (q ? ' ' + q : ''),
      writable: true, configurable: true
    })
    Object.defineProperty(fakeM, 'quoted', { value: m.quoted, configurable: true })
    Object.defineProperty(fakeM, 'mentionedJid', { value: m.mentionedJid || [], configurable: true })
    Object.defineProperty(fakeM, 'isCommand', { value: true, writable: true, configurable: true })
    Object.defineProperty(fakeM, 'plugin', { value: name, writable: true, configurable: true })

    let exec = {
      match, usedPrefix: PREFIX, noPrefix: cmd + (q ? ' ' + q : ''),
      _args: args, args, command: cmd, text: q, conn, participants,
      groupMetadata, user, bot, isROwner, isOwner, isRAdmin, isAdmin,
      isBotAdmin, isPrems, chatUpdate, __dirname, __filename
    }

    await plugin.call(this, fakeM, exec)
    return true

  } catch (e) {
    console.log('AlzRiss Command Error:', e)
    return m.reply('Hweh... AlzRiss error pas jalanin itu 🥹')
  }
}

export default handler