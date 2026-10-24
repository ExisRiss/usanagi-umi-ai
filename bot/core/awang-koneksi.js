/* By AlzRiss - Usanagi Umi AI */

import {
  default as makeWASocket,
  DisconnectReason,
  fetchLatestBaileysVersion,
  Browsers,
  makeCacheableSignalKeyStore,
} from '@rexxhayanasi/elaina-baileys'
import { Boom } from '@hapi/boom'
import pino from 'pino'
import { settings } from '../config/settings.js'
import {
  ensureSessionDir,
  clearSession,
  useSQLiteAuthState,
} from './awang-sesi.js'
import { printStatus } from '../tampilan/awang-banner.js'

const logger = pino({ level: 'silent' })

let pairingRequested = false
let pairingCodeShown = false

async function resolvePairingNumber() {
  if (process.env.PAIRING_NUMBER) {
    return process.env.PAIRING_NUMBER.replace(/\D/g, '')
  }

  if (settings.pairingNumber) {
    return settings.pairingNumber.replace(/\D/g, '')
  }

  if (process.stdin.isTTY) {
    const readlineSync = (await import('readline-sync')).default
    const chalk = (await import('chalk')).default
    console.log('')
console.log(chalk.cyanBright('╭───────────────────────────╮'))
console.log(chalk.cyanBright('│') + chalk.bold.whiteBright('     📱 PAIRING NUMBER     ') + chalk.cyanBright('│'))
console.log(chalk.cyanBright('├───────────────────────────┤'))
console.log(chalk.cyanBright('│') + chalk.whiteBright('  Masukkan nomor bot       ') + chalk.cyanBright('│'))
console.log(chalk.cyanBright('│') + chalk.yellowBright('  Format: ') + chalk.greenBright('628xxxxxxxxxx') + chalk.cyanBright('    │'))
console.log(chalk.cyanBright('╰───────────────────────────╯'))
    const input = readlineSync.question(chalk.cyan('  › '))
    return input.replace(/\D/g, '')
  }

  return null
}

export async function startConnection({ onReady, onPluginReload } = {}) {
  await ensureSessionDir()

  const { state, saveCreds } = await useSQLiteAuthState()
  const { version } = await fetchLatestBaileysVersion()

  const conn = makeWASocket({
    version,
    logger,
    printQRInTerminal: false,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    browser: Browsers.ubuntu('Chrome'),
    generateHighQualityLinkPreview: true,
    syncFullHistory: false,
    markOnlineOnConnect: true,
  })

  const usingPairing = !state.creds?.registered

  conn.ev.on('creds.update', saveCreds)

  const requestPairingCodeWithRetry = async (number) => {
    let code
    let lastError
    const maxAttempts = 3

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        code = await conn.requestPairingCode(number)
        break
      } catch (attemptErr) {
        lastError = attemptErr
        if (attempt < maxAttempts) {
          printStatus(
            `Percobaan ${attempt} gagal (${attemptErr.message}), mencoba lagi...`,
            'warn'
          )
          await new Promise((resolve) => setTimeout(resolve, 2000))
        }
      }
    }

    if (!code) throw lastError
    return code
  }

  conn.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update

    const readyForPairing = usingPairing && !state.creds?.registered && (qr || connection === 'connecting')

    if (readyForPairing && !pairingRequested) {
      pairingRequested = true

      setTimeout(async () => {
        const number = await resolvePairingNumber()

        if (!number) {
          printStatus(
            'Nomor pairing tidak ditemukan. Isi PAIRING_NUMBER (env) atau settings.pairingNumber di config/settings.js',
            'error'
          )
          process.exit(1)
        }

        try {
          printStatus(`Meminta kode untuk nomor tujuan : ${number}`, 'loading')

          const code = await requestPairingCodeWithRetry(number)
          pairingCodeShown = true

          const formattedCode = code?.match(/.{1,4}/g)?.join('-') || code
          console.log('')
console.log('  \x1b[36m╭────────────────────╮\x1b[0m')
          console.log('  \x1b[36m│\x1b[0m  \x1b[1m\x1b[37m🔐 PAIRING CODE\x1b[0m  \x1b[36m │\x1b[0m')
          console.log('  \x1b[36m├────────────────────┤\x1b[0m')
          console.log(`  \x1b[36m│\x1b[0m      \x1b[1m\x1b[32m${String(formattedCode)}\x1b[0m     \x1b[36m│\x1b[0m`)
          console.log('  \x1b[36m╰────────────────────╯\x1b[0m')
          console.log('')
          printStatus('WhatsApp > Perangkat Tertaut > Tautkan Perangkat', 'info')
          printStatus('Pilih "Tautkan dengan nomor telepon", lalu masukkan kode di atas.', 'info')
          printStatus('Kode berlaku sekitar 60 detik. Restart bot jika kode kedaluwarsa.', 'warn')
        } catch (err) {
          printStatus(`Gagal meminta pairing code: ${err.message}`, 'error')
          printStatus('Pastikan nomor benar dan koneksi internet stabil, lalu restart bot.', 'warn')
        }
      }, 3000)
    }

    if (connection === 'open') {
      pairingRequested = false
      printStatus('Berhasil terhubung ke WhatsApp!', 'success')
      onReady?.(conn)
    }

    if (connection === 'close') {
      const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut

      if (statusCode === DisconnectReason.loggedOut) {
        printStatus('Sesi logout dari perangkat. Menghapus sesi lama...', 'warn')
        try {
          clearSession()
        } catch (err) {
          printStatus(`Gagal menghapus sesi lama: ${err.message}`, 'error')
        }
        pairingRequested = false
        pairingCodeShown = false
      }

      if (shouldReconnect) {
        printStatus('Koneksi terputus, mencoba menyambung ulang...', 'warn')
        setTimeout(() => startConnection({ onReady, onPluginReload }), 3000)
      } else {
        printStatus('Bot berhenti (logged out). Jalankan ulang untuk pairing baru.', 'error')
        process.exit(0)
      }
    }
  })

  return conn
}

export default { startConnection }
