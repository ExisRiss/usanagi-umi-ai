import fetch from 'node-fetch'
import { promises as fs } from 'fs'
import { tmpdir } from 'os'
import path from 'path'
import { exec as _exec } from 'child_process'
import { promisify } from 'util'

const exec = promisify(_exec)

const araAudioURLs = [
  'https://bucin-livid.vercel.app/audio/ara2.mp3',
  'https://bucin-livid.vercel.app/audio/ara.mp3',
  'https://bucin-livid.vercel.app/audio/audio_ara-ara.mp3'
]

const loveyouAudioURLs = [
  'https://bucin-livid.vercel.app/audio/lopyou.mp3',
]

async function toPTT(url) {
  const id = Date.now()

  const input = path.join(tmpdir(), `${id}.mp3`)
  const output = path.join(tmpdir(), `${id}.ogg`)

  const res = await fetch(url)
  const buffer = Buffer.from(await res.arrayBuffer())

  await fs.writeFile(input, buffer)

  await exec(
    `ffmpeg -y -i "${input}" -vn -c:a libopus -b:a 128k "${output}"`
  )

  const result = await fs.readFile(output)

  await fs.unlink(input).catch(() => {})
  await fs.unlink(output).catch(() => {})

  return result
}

let handler = async (m, { conn }) => {
  if (!m.text) return

  const text = m.text.toLowerCase().trim()

  const araRegex =
    /^(ara|ara ara|araa+|araa araa+)$/i

  const loveRegex =
    /^(lopyou|lopyu|loveyou|love|love you|lope|lupyu|iloveyou)$/i

  if (araRegex.test(text)) {
    const audio =
      araAudioURLs[Math.floor(Math.random() * araAudioURLs.length)]

    const ptt = await toPTT(audio)

    return conn.sendMessage(
      m.chat,
      {
        audio: ptt,
        mimetype: 'audio/ogg; codecs=opus',
        ptt: true
      },
      { quoted: m }
    )
  }

  if (loveRegex.test(text)) {
    const audio =
      loveyouAudioURLs[Math.floor(Math.random() * loveyouAudioURLs.length)]

    const ptt = await toPTT(audio)

    return conn.sendMessage(
      m.chat,
      {
        audio: ptt,
        mimetype: 'audio/ogg; codecs=opus',
        ptt: true
      },
      { quoted: m }
    )
  }
}

handler.customPrefix =
  /^(ara|ara ara|araa+|araa araa+|lopyou|lopyu|loveyou|love|love you|lope|lupyu|iloveyou)$/i

handler.command = /^(ara|araa+|lopyou|lopyu|loveyou|love|lope|lupyu|iloveyou)$/i

export default handler