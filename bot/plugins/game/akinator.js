/**
 * akinator.js
 * Base: https://id.akinator.com
 *
 * ESM Plugin - Usanagi Umi AI
 * Install: npm install got-scraping cheerio
 */

import cheerio from 'cheerio'

const BASE = 'https://id.akinator.com'
const THEMES = {
  1: ['Karakter', 1],
  2: ['Hewan', 14],
  3: ['Benda', 2]
}
const CHOICES = [
  ['1', 'Ya', 0],
  ['2', 'Tidak', 1],
  ['3', 'Tidak tahu', 2],
  ['4', 'Mungkin', 3],
  ['5', 'Mungkin tidak', 4]
]

/* =========================================================
 * GLOBAL SESSION
 * ========================================================= */
if (!global.akinatorSessions) global.akinatorSessions = {}

/* =========================================================
 * GOT SCRAPING & COOKIE
 * ========================================================= */
let scrape;
async function akinator() {
  if (!scrape) scrape = (await import('got-scraping')).gotScraping
  return scrape
}

function cookieString(jar) {
  if (!jar) return ''
  return Object.entries(jar).map(([key, value]) => `${key}=${value}`).join('; ')
}

function saveCookies(jar, res) {
  if (!jar || !res || !res.headers['set-cookie']) return
  for (const cookie of res.headers['set-cookie']) {
    const [kv] = cookie.split(';')
    const index = kv.indexOf('=')
    if (index > 0) {
      const key = kv.slice(0, index).trim()
      const value = kv.slice(index + 1).trim()
      jar[key] = value
    }
  }
}

/* =========================================================
 * REQUEST & PARSER
 * ========================================================= */
async function post(game, path, form) {
  const g = await akinator()
  const headers = {
    'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'x-requested-with': 'XMLHttpRequest',
    'origin': BASE,
    'referer': BASE + '/game'
  }
  
  if (game.cookies && Object.keys(game.cookies).length > 0) {
    headers.cookie = cookieString(game.cookies)
  }

  const res = await g({
    url: BASE + path,
    method: 'POST',
    form,
    headers,
    throwHttpErrors: false
  })
  
  saveCookies(game.cookies, res)
  return res
}

function parseJSON(body) {
  try {
    return JSON.parse(body)
  } catch {
    throw new Error('Response Akinator bukan JSON.')
  }
}

/* =========================================================
 * LOGIKA GAME AKINATOR
 * ========================================================= */
async function start(game) {
  const g = await akinator()
  const home = await g({ url: BASE + '/', throwHttpErrors: false })
  saveCookies(game.cookies, home)
  
  const res = await post(game, '/game', { sid: String(game.sid), cm: 'false' })
  const body = res.body
  const $ = cheerio.load(body)
  
  const session = body.match(/session:\s*'([^']+)'/)?.[1] || body.match(/name="session"[^>]*value="([^"]+)"/)?.[1]
  const identifiant = body.match(/localStorage\.setItem\('identifiant',\s*'([^']+)'\)/)?.[1] || body.match(/name="identifiant"[^>]*value="([^"]+)"/)?.[1] || ''
  const question = $('#question-label').text().trim()
  
  if (!session || !question) throw new Error('Gagal mengambil data dari Akinator.')
  
  game.session = session
  game.identifiant = identifiant
  game.question = question
  game.step = parseInt(body.match(/localStorage\.setItem\('step',\s*'(\d+)'\)/)?.[1] || '1')
  game.num = 1
  game.progression = 0
  game.stepLastProposition = ''
}

function handle(game, data) {
  if (data.completion === 'KO') throw new Error('Sesi expired.')
  if (data.completion === 'SOUNDLIKE') return { lost: true }
  
  if (data.id_proposition) {
    game.step = parseInt(data.step ?? game.step)
    game.stepLastProposition = String(game.step)
    return {
      guess: {
        id: data.id_proposition, 
        id_base: data.id_base_proposition,
        name: data.name_proposition, 
        description: data.description_proposition,
        photo: data.photo // <-- Mengambil foto karakter
      }
    }
  }
  
  if (data.question) game.question = data.question
  if (data.step !== undefined) game.step = parseInt(data.step)
  if (data.progression !== undefined) game.progression = parseFloat(data.progression)
  
  return {}
}

async function answer(game, id) {
  const res = await post(game, '/answer', {
    step: String(game.step), progression: String(game.progression),
    sid: String(game.sid), cm: 'false', answer: String(id),
    step_last_proposition: game.stepLastProposition, session: game.session
  })
  const result = handle(game, parseJSON(res.body))
  if (!result.guess && !result.lost) game.num++
  return result
}

async function back(game) {
  const res = await post(game, '/cancel_answer', {
    step: String(game.step), progression: String(game.progression),
    sid: String(game.sid), cm: 'false', session: game.session
  })
  handle(game, parseJSON(res.body))
  game.num = Math.max(1, game.num - 1)
}

async function exclude(game) {
  const res = await post(game, '/exclude', {
    step: String(game.step), sid: String(game.sid), cm: 'false',
    progression: String(game.progression), session: game.session, forward_answer: '1'
  })
  const result = handle(game, parseJSON(res.body))
  if (!result.guess && !result.lost) game.num++
  return result
}

async function confirm(game, guess) {
  try {
    await post(game, '/choice', {
      sid: String(game.sid), pid: String(guess.id),
      identifiant: game.identifiant, charac_name: guess.name,
      charac_desc: guess.description, session: game.session, step: String(game.step)
    })
  } catch {}
}

/* =========================================================
 * UI: TAMPILAN PESAN
 * ========================================================= */
async function sendTheme(m) {
  return m.reply(
    `╭─「 🎭 AKINATOR 」\n` +
    `│\n` +
    `│ Pilih tema permainan:\n` +
    `│ 1. Karakter\n` +
    `│ 2. Hewan\n` +
    `│ 3. Benda\n` +
    `│\n` +
    `│ Balas dengan angka *1*, *2*, atau *3*\n` +
    `│ Ketik *.akinator stop* untuk batal.\n` +
    `╰──────────────`
  )
}

async function sendQuestion(m, game) {
  game.state = 'question'
  return m.reply(
    `╭─「 🧠 AKINATOR 」\n` +
    `│\n` +
    `│ 🎭 Tema: *${game.theme}*\n` +
    `│ 📊 Progress: *${Math.round(game.progression)}%*\n` +
    `│ ❓ Pertanyaan: *${game.num}*\n` +
    `│\n` +
    `│ ${game.question}\n` +
    `│\n` +
    `│ 1. Ya\n` +
    `│ 2. Tidak\n` +
    `│ 3. Tidak tahu\n` +
    `│ 4. Mungkin\n` +
    `│ 5. Mungkin tidak\n` +
    `│\n` +
    `│ 0. Kembali ke sebelumnya\n` +
    `╰──────────────`
  )
}

async function handleResult(m, game, result, conn) {
  if (result.lost) {
    delete global.akinatorSessions[m.sender]
    return m.reply(`😵 Akinator menyerah! Aku tidak bisa menebak jawabanmu.`)
  }
  
  if (result.guess) {
    game.guess = result.guess
    game.state = 'confirm'
    
    let teks = `╭─「 🎯 TEBAKAN AKINATOR 」\n` +
               `│\n` +
               `│ 👤 *${result.guess.name}*\n` +
               `│ 📝 ${result.guess.description || '-'}\n` +
               `│\n` +
               `│ Apakah tebakan ini benar?\n` +
               `│ Balas dengan *1* (Ya) atau *2* (Tidak)\n` +
               `╰──────────────`
               
    // Mengirim gambar jika foto tersedia
    if (result.guess.photo) {
      return conn.sendMessage(m.chat, { image: { url: result.guess.photo }, caption: teks }, { quoted: m })
    } else {
      return m.reply(teks)
    }
  }
  return sendQuestion(m, game)
}

/* =========================================================
 * MAIN HANDLER
 * ========================================================= */
let handler = async (m, { text, conn }) => {
  const id = m.sender
  const input = String(text || '').trim().toLowerCase()

  if (input === 'stop') {
    if (global.akinatorSessions[id]) {
      delete global.akinatorSessions[id]
      return m.reply(`✅ Game Akinator dihentikan.`)
    }
    return m.reply(`ℹ️ Tidak ada game Akinator yang sedang aktif.`)
  }

  const defaultSession = {
    sid: 1, session: '', identifiant: '', step: 1, num: 1,
    progression: 0, stepLastProposition: '', question: '',
    theme: '', cookies: {}, state: 'theme', guess: null
  }

  if (THEMES[input]) {
    global.akinatorSessions[id] = {
      ...defaultSession,
      sid: THEMES[input][1],
      theme: THEMES[input][0]
    }
    
    let game = global.akinatorSessions[id]
    try {
      await m.reply(`⏳ Memulai Akinator...\n🎭 Tema: *${game.theme}*`)
      await start(game)
      game.state = 'question'
      return sendQuestion(m, game)
    } catch (e) {
      delete global.akinatorSessions[id]
      return m.reply(`❌ Gagal memulai Akinator:\n${e.message}`)
    }
  }

  if (global.akinatorSessions[id]) {
    return m.reply(`⚠️ Selesaikan game kamu yang sedang berjalan, atau ketik *.akinator stop* untuk membatalkan.`)
  }

  global.akinatorSessions[id] = { ...defaultSession }
  return sendTheme(m)
}

/* =========================================================
 * INTERCEPTOR (MEMBACA ANGKA 1-5 SECARA OTOMATIS)
 * ========================================================= */
handler.before = async function (m, { conn }) {
  if (m.isBaileys || m.fromMe || !m.text) return false
  
  const id = m.sender
  const input = m.text.trim().toLowerCase()
  let game = global.akinatorSessions[id]
  
  if (!game) return false

  if (game.state === 'theme') {
    if (!THEMES[input]) return false

    game.sid = THEMES[input][1]
    game.theme = THEMES[input][0]
    
    try {
      await m.reply(`⏳ Memulai Akinator...\n🎭 Tema: *${game.theme}*`)
      await start(game)
      game.state = 'question'
      await sendQuestion(m, game)
    } catch (e) {
      delete global.akinatorSessions[id]
      m.reply(`❌ Gagal memulai Akinator: ${e.message}`)
    }
    return true
  }

  if (game.state === 'question') {
    if (input === '0') {
      if (game.num <= 1) {
        m.reply(`⚠️ Belum ada pertanyaan sebelumnya.`)
        return true
      }
      try {
        await back(game)
        await sendQuestion(m, game)
      } catch (e) {
        m.reply(`❌ Gagal kembali: ${e.message}`)
      }
      return true
    }

    const pick = CHOICES.find(choice => choice[0] === input)
    if (!pick) return false

    try {
      const result = await answer(game, pick[2])
      await handleResult(m, game, result, conn) // Me-lempar parameter conn
    } catch (e) {
      delete global.akinatorSessions[id]
      m.reply(`❌ Terjadi kesalahan: ${e.message}`)
    }
    return true
  }

  if (game.state === 'confirm') {
    if (!['1', '2', 'y', 'n', 'ya', 'tidak'].includes(input)) return false

    const yes = ['1', 'y', 'ya'].includes(input)

    if (yes) {
      await confirm(game, game.guess)
      const result = game.guess
      const totalNum = game.num
      delete global.akinatorSessions[id]
      
      let teks = `╭─「 🎯 HASIL AKINATOR 」\n` +
                 `│\n` +
                 `│ 👤 *${result.name}*\n` +
                 `│ 📝 ${result.description || '-'}\n` +
                 `│\n` +
                 `│ ❓ Pertanyaan total: ${totalNum}\n` +
                 `╰──────────────`

      // Kirim hasil akhir dengan gambar jika ada
      if (result.photo) {
        await conn.sendMessage(m.chat, { image: { url: result.photo }, caption: teks }, { quoted: m })
      } else {
        await m.reply(teks)
      }
      return true
    }

    try {
      await m.reply(`❌ Bukan itu?\n🧠 Oke, Akinator lanjut mencari tahu...`)
      const result = await exclude(game)
      await handleResult(m, game, result, conn) // Me-lempar parameter conn
    } catch (e) {
      delete global.akinatorSessions[id]
      m.reply(`❌ Gagal melanjutkan: ${e.message}`)
    }
    return true
  }

  return false
}

handler.help = ['akinator', 'akinator stop']
handler.tags = ['game']
handler.command = /^akinator$/i
handler.limit = true

export default handler