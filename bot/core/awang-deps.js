/* By AlzRiss - Usanagi Umi AI */

import { spawn } from 'child_process'
import path from 'path'
import { ensureYtDlp } from '../lib/awang-ytdlp.js'
import { printSection, printStatus } from '../tampilan/awang-banner.js'

const root = path.resolve(new URL('..', import.meta.url).pathname)
let running = null

function exec(command, args = [], timeout = 180000) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { cwd: root, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] })
    let stdout = ''
    let stderr = ''
    const timer = setTimeout(() => {
      proc.kill('SIGKILL')
      reject(new Error(`${command} timeout`))
    }, timeout)
    proc.stdout.on('data', x => { stdout += x.toString() })
    proc.stderr.on('data', x => { stderr += x.toString() })
    proc.on('error', err => {
      clearTimeout(timer)
      reject(err)
    })
    proc.on('close', code => {
      clearTimeout(timer)
      if (code === 0) resolve({ stdout, stderr })
      else reject(new Error((stderr || stdout).trim().slice(-800) || `${command} keluar dengan kode ${code}`))
    })
  })
}

async function ensureNodeFfmpeg() {
  const missing = []
  for (const pkg of ['@ffmpeg-installer/ffmpeg', 'fluent-ffmpeg']) {
    try {
      await import(pkg)
    } catch {
      missing.push(pkg)
    }
  }
  if (!missing.length) return

  printStatus(`Memasang paket ffmpeg yang belum ada: ${missing.join(', ')}...`, 'loading')

  await exec(process.platform === 'win32' ? 'npm.cmd' : 'npm', [
    'install', '--no-audit', '--no-fund', '--no-save', ...missing,
  ], 300000)

  printStatus('Paket ffmpeg berhasil dipasang.', 'success')
}

export function ensurePlayDependencies() {
  if (running) return running

  running = (async () => {
    printSection('Menyiapkan Dependensi Download')

    try {
      await ensureNodeFfmpeg()
    } catch (err) {
      printStatus(`Gagal memasang paket ffmpeg: ${err.message}`, 'warn')
    }

    try {
      const bin = await ensureYtDlp()
      printStatus(`yt-dlp siap dipakai (${bin})`, 'success')
    } catch (err) {
      printStatus(`yt-dlp tidak dapat disiapkan otomatis: ${err.message}`, 'warn')
      printStatus('Fitur play/tiktok/facebook/ytmp3/ytmp4 tetap jalan lewat jalur cadangan (resolver/scraper/API), cuma kurang stabil tanpa yt-dlp.', 'warn')
    }
  })()

  return running
}
