
import os from 'node:os'
import path from 'node:path'
import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import { execFile } from 'node:child_process'

const FFMPEG_BIN = process.env.FFMPEG_PATH || 'ffmpeg'

export function makeTempPath(prefix = 'usanagi', ext = 'tmp') {
  const id = crypto.randomBytes(10).toString('hex')
  return path.join(os.tmpdir(), `${prefix}-${Date.now()}-${id}.${String(ext).replace(/^\./, '')}`)
}

export async function transcodeFile(inputPath, outputPath, options = {}) {
  const args = ['-y']
  if (Array.isArray(options.inputOptions)) args.push(...options.inputOptions)
  args.push('-i', inputPath)
  if (Array.isArray(options.videoFilters) && options.videoFilters.length) args.push('-vf', options.videoFilters.join(','))
  if (Array.isArray(options.audioFilters) && options.audioFilters.length) args.push('-af', options.audioFilters.join(','))
  if (Array.isArray(options.outputOptions)) args.push(...options.outputOptions)
  if (options.format) args.push('-f', options.format)
  args.push(outputPath)

  await new Promise((resolve, reject) => {
    execFile(FFMPEG_BIN, args, { timeout: options.timeoutMs ?? 120000, killSignal: 'SIGKILL', maxBuffer: 2 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        const detail = String(stderr || stdout || error.message).trim().split('\n').slice(-6).join(' | ')
        reject(new Error(detail || 'FFmpeg gagal'))
        return
      }
      resolve()
    })
  })
}

export async function transcodeBuffer(buffer, inputExt, outputExt, options = {}) {
  if (!Buffer.isBuffer(buffer) || !buffer.length) throw new Error('Input buffer kosong')
  const inputPath = makeTempPath('usanagi-input', inputExt)
  const outputPath = makeTempPath('usanagi-output', outputExt)
  try {
    await fs.writeFile(inputPath, buffer)
    await transcodeFile(inputPath, outputPath, options)
    const result = await fs.readFile(outputPath)
    if (!result.length) throw new Error('Output FFmpeg kosong')
    return result
  } finally {
    await Promise.allSettled([fs.unlink(inputPath), fs.unlink(outputPath)])
  }
}
