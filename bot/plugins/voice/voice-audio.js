import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'

const effects = {
  // 🎵 BASIC
  bass: 'equalizer=f=94:width_type=o:width=2:g=30',
  bassboost: 'bass=g=15',
  treble: 'treble=g=8',
  blown: 'acrusher=.1:1:64:0:log',
  deep: 'asetrate=32000,aresample=48000',
  earrape: 'volume=12',
  fast: 'atempo=1.63,asetrate=44100,aresample=48000',
  fat: 'atempo=1.6,asetrate=22100,aresample=48000',
  nightcore: 'atempo=1.06,asetrate=55125,aresample=48000',
  slow: 'atempo=0.7,asetrate=44100,aresample=48000',

  // 🗣️ VOICE
  tupai: 'atempo=0.5,asetrate=65100,aresample=48000',
  squirrel: 'atempo=0.5,asetrate=65100,aresample=48000',
  chipmunk: 'atempo=0.5,asetrate=65100,aresample=48000',

  helium: 'atempo=1.25,asetrate=60000,aresample=48000',
  demon: 'asetrate=30000,aresample=48000,atempo=0.8',
  robot: 'afftfilt=real=hypot(re\\,im)*sin(0):imag=hypot(re\\,im)*cos(0):win_size=512:overlap=0.75',

  // 🌌 SPACE / ATMOSPHERE
  echo: 'aecho=0.8:0.88:700:0.35',
  echo2: 'aecho=0.8:0.9:1200:0.4',
  reverb: 'aecho=0.8:0.9:1000:0.3',
  reverb2: 'aecho=0.8:0.9:1800:0.35',

  // 📞 SPECIAL
  telephone: 'highpass=f=500,lowpass=f=3000',
  radio: 'highpass=f=400,lowpass=f=3500,acrusher=bits=8:mix=0.15',
  megaphone: 'highpass=f=700,lowpass=f=3500,acrusher=bits=8:mix=0.15',
  underwater: 'lowpass=f=500',

  // 🤖 DISTORTION
  distortion: 'acrusher=bits=8:mix=0.5',
  metal: 'acrusher=bits=6:mix=0.35',
  blown2: 'acrusher=bits=5:mix=0.5',

  // ✨ CLEAN / QUALITY
  smooth: 'afftdn=nf=-25,volume=1.1',
  clean: 'afftdn=nf=-25,loudnorm',
  normalize: 'loudnorm',
  loud: 'volume=2',
  volumeup: 'volume=2',
  volumedown: 'volume=0.5',

  // 🔄 SPECIAL EFFECT
  reverse: 'areverse',
  vibra: 'vibrato=f=15',
  tremolo: 'tremolo=f=8:d=0.8',

  // 🌊 8D-LIKE EFFECT
  '8d': 'apulsator=hz=0.12:width=1',

  // 🎚️ STEREO
  stereo: 'stereowiden=delay=20:feedback=0.3:crossfeed=0.3:drymix=0.8',
  wide: 'stereowiden=delay=30:feedback=0.25:crossfeed=0.2:drymix=0.8',

  // 🎤 VOCAL
  karaoke: 'pan=stereo|c0=c0-c1|c1=c1-c0',

  // 👻 HORROR
  ghost: 'aecho=0.8:0.9:1200:0.4,lowpass=f=3500',
  haunted: 'asetrate=36000,aresample=48000,aecho=0.8:0.9:1500:0.45',

  // 🔊 EXTRA
  bass2: 'bass=g=20:f=100',
  treble2: 'treble=g=12:f=5000',
  soft: 'volume=0.8,acompressor=threshold=-20dB:ratio=2:attack=20:release=200',
  compressor: 'acompressor=threshold=-18dB:ratio=3:attack=20:release=250'
}

const commands = Object.keys(effects)

function runFFmpeg(input, output, filter) {
  return new Promise((resolve, reject) => {
    const args = [
      '-y',
      '-i', input,

      '-vn',
      '-af', filter,

      '-map_metadata', '-1',

      '-ar', '48000',
      '-ac', '1',

      '-c:a', 'libopus',
      '-b:a', '128k',

      output
    ]

    const ffmpeg = spawn('ffmpeg', args, {
      stdio: ['ignore', 'ignore', 'pipe']
    })

    let stderr = ''

    ffmpeg.stderr.on('data', data => {
      stderr += data.toString()
    })

    ffmpeg.on('error', err => {
      reject(err)
    })

    ffmpeg.on('close', code => {
      if (code === 0) {
        resolve()
      } else {
        const error = new Error(
          `FFmpeg exited with code ${code}\n${stderr.slice(-3000)}`
        )

        reject(error)
      }
    })
  })
}

let handler = async (m, { conn, command }) => {
  const q = m.quoted ? m.quoted : m
  const mime = (q.msg || q).mimetype || ''

  if (!/^audio\//i.test(mime)) {
    return m.reply(
      '🎵 Balas audio atau VN dengan command ini!\n\n' +
      `Contoh: .${command}`
    )
  }

  const effect = String(command).toLowerCase()
  const filter = effects[effect]

  if (!filter) {
    return m.reply(
      '❌ Efek tidak dikenali.\n\n' +
      `Efek tersedia: ${commands.map(v => '.' + v).join(', ')}`
    )
  }

  const tmp = path.join(process.cwd(), 'tmp')

  try {
    if (!fs.existsSync(tmp)) {
      fs.mkdirSync(tmp, { recursive: true })
    }

    await m.react('🎵')

    const audio = await q.download()

    if (!audio) {
      throw new Error('Gagal mengunduh audio')
    }

    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

    const input = path.join(tmp, `${id}.input`)
    const output = path.join(tmp, `${id}.ogg`)

    await fs.promises.writeFile(input, audio)

    try {
      await runFFmpeg(input, output, filter)
    } catch (err) {
      console.error('[VOICE FFmpeg]', err)

      return m.reply(
        '❌ Gagal memproses audio.\n\n' +
        'Pastikan FFmpeg sudah terinstall di VPS/server.'
      )
    } finally {
      await fs.promises.unlink(input).catch(() => {})
    }

    if (!fs.existsSync(output)) {
      throw new Error('File hasil tidak ditemukan')
    }

    const result = await fs.promises.readFile(output)

    if (!result?.length) {
      throw new Error('File hasil kosong')
    }

    await conn.sendMessage(
      m.chat,
      {
        audio: result,
        mimetype: 'audio/ogg; codecs=opus',
        ptt: true
      },
      {
        quoted: m
      }
    )

    await fs.promises.unlink(output).catch(() => {})

    await m.react('✅')

  } catch (e) {
    console.error('[VOICE ERROR]', e)

    await m.react('❌').catch(() => {})

    m.reply(
      '❌ Terjadi kesalahan saat memproses audio.\n\n' +
      `${e.message || e}`
    )
  }
}

handler.help = commands
handler.tags = ['voice']

handler.command = new RegExp(
  `^(${commands.join('|')})$`,
  'i'
)

export default handler