import fetch from 'node-fetch'
import { spawn } from 'child_process'
import sharp from 'sharp'
import { prepareWAMessageMedia } from '@rexxhayanasi/elaina-baileys'

/* ================= ANTI LOAD DOBEL ================= */
if (!global.autosholatLoaded) {
  global.autosholatLoaded = true
  console.log('✅ Autosholat loaded sekali')
}

/* ================= CONFIG ================= */
const DURASI_TUTUP = 5
const TOLERANSI = 60
const SOURCE_URL = 'https://kemenag.go.id/'

let cacheJadwal = {}
let sholatLock = {}
let audioCache = {}
let thumbnailBuffer = null
let thumbnailHQ = null

/* ================= LINK ================= */
const THUMBNAIL =
  'https://raw.githubusercontent.com/hamm-r/uploader/main/1780397442761-426.jpg'

const AUDIO_ADZAN = {
  Subuh: [
    'https://raw.githubusercontent.com/hamm-r/uploader/main/1778882820327-470.mp3'
  ],
  Default: [
    'https://raw.githubusercontent.com/hamm-r/uploader/main/1778882918734-987.mp3'
  ]
}

/* ================= TIME ================= */
function getNow() {
  return new Date(
    new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Jakarta'
    })
  )
}

function isJumat(now) {
  return now.getDay() === 5
}

function isBetweenJumat(now) {
  let h = now.getHours()
  return h >= 11 && h < 13
}

/* ================= FETCH BUFFER ================= */
async function fetchBuffer(url, timeout = 20000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0',
        Accept: '*/*'
      }
    })

    if (!res.ok) throw new Error(`Fetch gagal ${res.status}`)

    const arr = await res.arrayBuffer()
    return Buffer.from(arr)
  } finally {
    clearTimeout(timer)
  }
}

/* ================= THUMBNAIL ================= */
async function getThumbnail() {
  try {
    if (thumbnailBuffer?.length) return thumbnailBuffer

    let raw = await fetchBuffer(THUMBNAIL)

    let resized = await sharp(raw)
      .resize(1280, 720, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 90 })
      .toBuffer()

    thumbnailBuffer = resized
    return resized
  } catch (e) {
    console.log('Thumbnail error:', e.message || e)
    return Buffer.alloc(0)
  }
}

async function getHighQualityThumbnail(conn) {
  try {
    if (thumbnailHQ) return thumbnailHQ

    let thumb = await getThumbnail()
    if (!thumb?.length) return null

    const { imageMessage } = await prepareWAMessageMedia(
      { image: thumb },
      {
        upload: conn.waUploadToServer,
        mediaTypeOverride: 'thumbnail-link'
      }
    )

    imageMessage.width = 1280
    imageMessage.height = 720

    thumbnailHQ = imageMessage
    return imageMessage
  } catch (e) {
    console.log('HQ Thumbnail error:', e.message || e)
    return null
  }
}

/* ================= CONVERT OPUS SAFE ================= */
async function convertBufferToOpus(input) {
  return await new Promise((resolve, reject) => {
    let chunks = []
    let stderr = ''
    let settled = false

    const ffmpeg = spawn('ffmpeg', [
      '-hide_banner',
      '-loglevel', 'error',
      '-i', 'pipe:0',
      '-vn',
      '-ac', '1',
      '-ar', '48000',
      '-c:a', 'libopus',
      '-b:a', '64k',
      '-vbr', 'on',
      '-compression_level', '10',
      '-f', 'ogg',
      'pipe:1'
    ], {
      stdio: ['pipe', 'pipe', 'pipe']
    })

    const done = (err, data) => {
      if (settled) return
      settled = true
      err ? reject(err) : resolve(data)
    }

    ffmpeg.stdout.on('data', chunk => chunks.push(chunk))

    ffmpeg.stderr.on('data', chunk => {
      stderr += chunk.toString()
    })

    ffmpeg.stdin.on('error', err => {
      if (err.code !== 'EPIPE') {
        done(err)
      }
    })

    ffmpeg.on('error', err => done(err))

    ffmpeg.on('close', code => {
      let out = Buffer.concat(chunks)

      if (code !== 0 || !out.length) {
        return done(new Error(stderr || 'FFmpeg gagal convert opus'))
      }

      done(null, out)
    })

    try {
      ffmpeg.stdin.end(input)
    } catch (e) {
      if (e.code !== 'EPIPE') done(e)
    }
  })
}

/* ================= GET AUDIO ================= */
async function getAudioAdzan(nama) {
  let urls = nama === 'Subuh' ? AUDIO_ADZAN.Subuh : AUDIO_ADZAN.Default

  for (let url of urls) {
    try {
      if (audioCache[url]) return audioCache[url]

      let raw = await fetchBuffer(url)
      if (!raw || raw.length < 1000) continue

      try {
        let opus = await convertBufferToOpus(raw)

        if (opus && opus.length > 1000) {
          audioCache[url] = {
            buffer: opus,
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true
          }

          return audioCache[url]
        }
      } catch (e) {
        console.log('Convert opus gagal, fallback MP3:', e.message || e)
      }

      audioCache[url] = {
        buffer: raw,
        mimetype: 'audio/mpeg',
        ptt: false
      }

      return audioCache[url]
    } catch (e) {
      console.log('Audio gagal:', e.message || e)
    }
  }

  return null
}

/* ================= JADWAL ================= */
async function getJadwal(kota = 'jakarta') {
  let today = getNow().toISOString().slice(0, 10)

  if (cacheJadwal[kota]?.date === today) {
    return cacheJadwal[kota].data
  }

  try {
    const cityMap = {
      jakarta: '1301',
      bandung: '1219',
      surabaya: '1631',
      yogyakarta: '1505',
      bekasi: '1204'
    }

    let id = cityMap[kota.toLowerCase()] || '1301'
    let url = `https://api.myquran.com/v2/sholat/jadwal/${id}/${today}`

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        Accept: 'application/json'
      }
    })

    if (!res.ok) throw new Error(`API jadwal gagal ${res.status}`)

    const json = await res.json()
    const d = json?.data?.jadwal

    if (!d) throw new Error('Data jadwal kosong')

    let hasil = {
      Fajr: d.subuh,
      Dhuhr: d.dzuhur,
      Asr: d.ashar,
      Maghrib: d.maghrib,
      Isha: d.isya
    }

    cacheJadwal[kota] = {
      date: today,
      data: hasil
    }

    return hasil
  } catch (e) {
    console.log('Error jadwal:', e.message || e)
    return null
  }
}

/* ================= AKURASI ================= */
function isNowMatch(waktu) {
  if (!waktu) return false

  let now = getNow()
  let [h, m] = waktu.split(':').map(Number)

  let target = new Date(now)
  target.setHours(h, m, 0, 0)

  let diff = (now - target) / 1000
  return diff >= 0 && diff <= TOLERANSI
}

/* ================= RESET ================= */
function resetDaily() {
  let today = getNow().toDateString()

  if (global.lastAutosholatReset !== today) {
    sholatLock = {}
    global.lastAutosholatReset = today
  }
}

/* ================= SEND PREVIEW ================= */
async function sendSholatPreview(conn, id, text) {
  try {
    let thumb = await getThumbnail()
    let highQualityThumbnail = await getHighQualityThumbnail(conn)
    let invisible = '\u200B'.repeat(400)

    return await conn.sendMessage(id, {
      text: `${SOURCE_URL}${invisible}

${text}`,
      linkPreview: {
        'matched-text': SOURCE_URL,
        matchedText: SOURCE_URL,
        canonicalUrl: SOURCE_URL,
        title: '❀ USANAGI UMI AI ❀',
        description: 'Pengingat Sholat • Waku Waku 🕌',
        previewType: 0,
        jpegThumbnail: thumb,
        highQualityThumbnail,
        thumbnailUrl: THUMBNAIL,
        linkPreviewMetadata: {
          linkMediaDuration: 0,
          socialMediaPostType: 4
        }
      },
      favicon: {
        url: THUMBNAIL
      }
    })
  } catch (e) {
    console.log('Send preview gagal:', e.message || e)
  }
}

/* ================= ENGINE ================= */
if (!global.autosholatInterval) {
  global.autosholatInterval = setInterval(async () => {
    try {
      resetDaily()

      let chats = global.db?.data?.chats || {}
      let conn = global.conn

      if (!conn) return

      for (let [id, chat] of Object.entries(chats)) {
        if (!chat?.autosholat) continue
        if (!id.endsWith('@g.us')) continue

        let now = getNow()

        /* ========= MODE JUMAT ========= */
        if (isJumat(now)) {
          if (isBetweenJumat(now)) {
            if (!chat.jumatClosed) {
              try {
                await conn.groupSettingUpdate(id, 'announcement')
              } catch {}

              await sendSholatPreview(
                conn,
                id,
                `🕌 *Waktu Sholat Jumat*

Grup ditutup 11:00 - 13:00 WIB`
              )

              chat.jumatClosed = true
            }

            continue
          }

          if (chat.jumatClosed && now.getHours() >= 13) {
            try {
              await conn.groupSettingUpdate(id, 'not_announcement')
            } catch {}

            await conn.sendMessage(id, {
              text: `✨ Grup dibuka kembali
Semoga ibadah diterima 🤲`
            }).catch(() => {})

            chat.jumatClosed = false
          }
        }

        /* ========= AUTO BUKA NORMAL ========= */
        if (chat.isClosed && Date.now() >= chat.tutupSampai) {
          try {
            await conn.groupSettingUpdate(id, 'not_announcement')
          } catch {}

          await conn.sendMessage(id, {
            text: '✨ Grup dibuka kembali'
          }).catch(() => {})

          chat.isClosed = false
        }

        let kota = chat.kota || 'jakarta'
        let jadwal = await getJadwal(kota)

        if (!jadwal) continue

        const sholatMap = {
          Subuh: jadwal.Fajr,
          Dzuhur: jadwal.Dhuhr,
          Ashar: jadwal.Asr,
          Maghrib: jadwal.Maghrib,
          Isya: jadwal.Isha
        }

        for (let [nama, waktu] of Object.entries(sholatMap)) {
          if (!isNowMatch(waktu)) continue

          let lockKey = `${id}-${nama}-${getNow().toDateString()}`
          if (sholatLock[lockKey]) continue

          sholatLock[lockKey] = true

          try {
            await conn.groupSettingUpdate(id, 'announcement')
          } catch {}

          chat.isClosed = true
          chat.tutupSampai = Date.now() + DURASI_TUTUP * 60 * 1000

          await sendSholatPreview(
            conn,
            id,
            `🕌 *Adzan ${nama}*

⏰ ${waktu} WIB
📍 ${kota}

Mari tunaikan sholat 🤲
🚫 Grup ditutup ${DURASI_TUTUP} menit`
          )

          let audio = await getAudioAdzan(nama)

          if (audio?.buffer) {
            await conn.sendMessage(id, {
              audio: audio.buffer,
              mimetype: audio.mimetype,
              ptt: audio.ptt
            }).catch(e => {
              console.log('Kirim audio gagal:', e.message || e)
            })
          } else {
            await conn.sendMessage(id, {
              text: '⚠️ Audio adzan gagal dimuat'
            }).catch(() => {})
          }
        }
      }
    } catch (e) {
      console.error('Autosholat error:', e.message || e)
    }
  }, 60 * 1000)
}

/* ================= ANTI BYPASS ================= */
export async function before(m, { isAdmin, isOwner }) {
  try {
    if (!m.isGroup) return

    let chat = global.db?.data?.chats?.[m.chat]
    if (!chat?.autosholat) return

    if ((chat.isClosed || chat.jumatClosed) && !isAdmin && !isOwner) {
      try {
        await m.delete()
      } catch {}
    }
  } catch {}
}

/* ================= COMMAND ================= */
let handler = async (m, { args, command }) => {
  let chat = global.db.data.chats[m.chat]

  if (command === 'autosholat') {
    let type = (args[0] || '').toLowerCase()

    if (type === 'on') {
      chat.autosholat = true
      return m.reply('🕌 Autosholat aktif')
    }

    if (type === 'off') {
      chat.autosholat = false
      chat.isClosed = false
      chat.jumatClosed = false
      chat.tutupSampai = 0

      try {
        await global.conn.groupSettingUpdate(m.chat, 'not_announcement')
      } catch {}

      return m.reply('❌ Autosholat mati')
    }

    if (type === 'status') {
      return m.reply(
`🕌 *STATUS AUTOSHOLAT*

Status: ${chat.autosholat ? 'Aktif ✅' : 'Mati ❌'}
Kota: ${chat.kota || 'jakarta'}
Tutup Normal: ${chat.isClosed ? 'Ya' : 'Tidak'}
Mode Jumat: ${chat.jumatClosed ? 'Ya' : 'Tidak'}`
      )
    }

    return m.reply(
`🕌 *AUTOSHOLAT*

.autosholat on
.autosholat off
.autosholat status
.setkota nama_kota

Contoh:
.setkota bandung`
    )
  }

  if (command === 'setkota') {
    if (!args[0]) {
      return m.reply('Contoh:\n.setkota bandung')
    }

    chat.kota = args[0].toLowerCase()

    return m.reply(`📍 Kota di set ke *${chat.kota}*`)
  }
}

handler.command = /^(autosholat|setkota)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler