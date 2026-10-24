
import { isOwner } from '../../lib/awang-cekakses.js'
import { isGroupAdmin, isBotAdmin } from '../../lib/awang-aksesgrub.js'
import {
  getGroupMetadata,
  getGroupStatus,
  setGroupMode,
} from '../../core/awang-grup.js'
import {
  createGroupSchedule,
  listGroupSchedules,
  cancelGroupSchedule,
} from '../../core/awang-jadwal.js'

const UNIT_MAP = new Map([
  ['detik', 1000],
  ['d', 1000],
  ['menit', 60 * 1000],
  ['m', 60 * 1000],
  ['jam', 60 * 60 * 1000],
  ['j', 60 * 60 * 1000],
  ['hari', 24 * 60 * 60 * 1000],
  ['h', 24 * 60 * 60 * 1000],
  ['minggu', 7 * 24 * 60 * 60 * 1000],
  ['mg', 7 * 24 * 60 * 60 * 1000],
])

const MAX_DURATION_MS = 3650 * 24 * 60 * 60 * 1000

function parseDuration(args) {
  if (!Array.isArray(args) || args.length !== 2) {
    throw new Error('Format durasi: <angka> <satuan>. Contoh: 10 detik atau 5 menit.')
  }

  const value = String(args[0] || '').trim()
  const unit = String(args[1] || '').trim().toLowerCase()

  if (!/^\d+$/.test(value)) throw new Error('Angka waktu harus berupa bilangan bulat positif.')
  const amount = Number(value)

  if (!Number.isSafeInteger(amount) || amount <= 0) {
    throw new Error('Waktu harus lebih besar dari 0 dan masih dalam batas aman.')
  }

  const multiplier = UNIT_MAP.get(unit)
  if (!multiplier) {
    throw new Error('Satuan waktu hanya: detik, menit, jam, hari, atau minggu.')
  }

  const duration = amount * multiplier
  if (!Number.isSafeInteger(duration) || duration > MAX_DURATION_MS) {
    throw new Error('Durasi terlalu besar. Maksimal jadwal adalah 10 tahun.')
  }

  return duration
}

function formatDuration(ms) {
  let remaining = Math.max(0, Number(ms) || 0)
  const parts = []

  const units = [
    ['minggu', 7 * 24 * 60 * 60 * 1000],
    ['hari', 24 * 60 * 60 * 1000],
    ['jam', 60 * 60 * 1000],
    ['menit', 60 * 1000],
    ['detik', 1000],
  ]

  for (const [label, size] of units) {
    const amount = Math.floor(remaining / size)
    if (amount > 0) {
      parts.push(`${amount} ${label}`)
      remaining -= amount * size
    }
    if (parts.length >= 2) break
  }

  return parts.join(' ') || '0 detik'
}

function formatDate(timestamp, timezone) {
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: timezone || 'Asia/Jakarta',
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp))
}

function helpText(usedPrefix) {
  return [
    '╭─〔 USANAGI GROUP CONTROL 〕',
    '│',
    `│ ${usedPrefix}gcopen`,
    '│ Buka group untuk semua anggota.',
    '│',
    `│ ${usedPrefix}gcclose`,
    '│ Tutup group untuk anggota.',
    '│',
    `│ ${usedPrefix}autoopen 10 menit`,
    '│ Buka otomatis setelah durasi.',
    '│',
    `│ ${usedPrefix}autoclose 10 menit`,
    '│ Tutup otomatis setelah durasi.',
    '│',
    `│ ${usedPrefix}jadwalgrup`,
    '│ Lihat jadwal aktif.',
    '│',
    `│ ${usedPrefix}deljadwal <id|semua>`,
    '│ Batalkan jadwal aktif.',
    '╰────────────────',
  ].join('\n')
}

async function ensurePermission(m, conn) {
  if (!m.isGroup) {
    await m.reply('Fitur ini hanya dapat digunakan di dalam group.')
    return { allowed: false, metadata: null }
  }

  try {
    const metadata = await getGroupMetadata(conn, m.chat)
    const owner = await isOwner(m.sender, conn)
    const admin = await isGroupAdmin(conn, m.chat, m.sender, metadata)
    const botAdmin = await isBotAdmin(conn, m.chat, metadata)

    if (!owner && !admin) {
      await m.reply('Perintah ini hanya dapat diatur oleh *owner bot* atau *admin group*.')
      return { allowed: false, metadata }
    }

    if (!botAdmin) {
      await m.reply('Bot harus menjadi *admin group* untuk mengubah status group atau menjalankan jadwal.')
      return { allowed: false, metadata }
    }

    return { allowed: true, metadata, owner, admin, botAdmin }
  } catch (err) {
    await m.reply(`Gagal memverifikasi permission group.\n\n${String(err?.message || err)}`)
    return { allowed: false, metadata: null }
  }
}

async function sendModeResult(m, conn, metadata, mode) {
  const status = await getGroupStatus(metadata)
  const groupName = metadata.subject || m.chat
  const requestedLabel = mode === 'closed' ? 'TERTUTUP' : 'TERBUKA'

  if (status === mode) {
    await m.reply([
      '╭─〔 USANAGI GROUP CONTROL 〕',
      '│',
      `│ Status : *${requestedLabel}*`,
      `│ Target : *${groupName}*`,
      '│',
      `│ Group sudah dalam keadaan *${requestedLabel.toLowerCase()}*.`,
      '│ Tidak ada perubahan yang dilakukan.',
      '╰────────────────',
    ].join('\n'))
    return false
  }

  await setGroupMode(conn, m.chat, mode)
  const updatedMetadata = await getGroupMetadata(conn, m.chat)
  const updatedStatus = await getGroupStatus(updatedMetadata)

  if (updatedStatus !== mode) {
    throw new Error('Status group belum berubah sesuai permintaan.')
  }

  await m.reply([
    '╭─〔 USANAGI GROUP CONTROL 〕',
    '│',
    `│ Status : *${requestedLabel}*`,
    `│ Target : *${groupName}*`,
    '│',
    `│ Group berhasil *${mode === 'closed' ? 'ditutup' : 'dibuka'}*.`,
    '╰────────────────',
  ].join('\n'))
  return true
}

const handler = async (m, { conn, rawConn, usedPrefix, settings }) => {
  const command = String(m.command || '').toLowerCase()
  const action = command

  if (!['gcopen', 'gcclose', 'autoopen', 'autoclose', 'jadwalgrup', 'deljadwal'].includes(action)) {
    await m.reply(helpText(usedPrefix))
    return
  }

  const permission = await ensurePermission(m, conn)
  if (!permission.allowed) return

  if (action === 'gcopen' || action === 'gcclose') {
    try {
      const metadata = permission.metadata || await getGroupMetadata(conn, m.chat)
      const mode = action === 'gcclose' ? 'closed' : 'open'
      await sendModeResult(m, rawConn, metadata, mode)
    } catch (err) {
      await m.reply(`Gagal mengubah status group.\n\n${String(err?.message || err)}`)
    }
    return
  }

  if (action === 'jadwalgrup') {
    const schedules = listGroupSchedules(m.chat)
    if (!schedules.length) {
      await m.reply([
        '╭─〔 JADWAL GROUP 〕',
        '│',
        '│ Tidak ada jadwal aktif.',
        '╰────────────────',
      ].join('\n'))
      return
    }

    const timezone = settings?.timezone || 'Asia/Jakarta'
    const lines = [
      '╭─〔 JADWAL GROUP 〕',
      '│',
    ]

    for (const schedule of schedules) {
      lines.push(
        `│ ID      : *${schedule.id}*`,
        `│ Action  : *${schedule.mode === 'closed' ? 'AUTO CLOSE' : 'AUTO OPEN'}*`,
        `│ Eksekusi: *${formatDate(schedule.executeAt, timezone)}*`,
        `│ Status  : *AKTIF*`,
        '│',
      )
    }

    lines.push('╰────────────────')
    await m.reply(lines.join('\n'))
    return
  }

  if (action === 'deljadwal') {
    const target = String(m.args?.[0] || '').trim().toLowerCase()
    if (!target) {
      await m.reply(`Gunakan *${usedPrefix}deljadwal <id|semua>*.`)
      return
    }

    const result = cancelGroupSchedule(m.chat, target === 'semua' ? null : target)
    if (!result.cancelled) {
      await m.reply('Jadwal tidak ditemukan atau sudah tidak aktif.')
      return
    }

    await m.reply([
      '╭─〔 JADWAL GROUP 〕',
      '│',
      `│ Status : *DIBATALKAN*`,
      `│ Jumlah : *${result.cancelled}* jadwal`,
      '╰────────────────',
    ].join('\n'))
    return
  }

  try {
    const duration = parseDuration(m.args)
    const mode = action === 'autoclose' ? 'closed' : 'open'
    const executeAt = Date.now() + duration
    const metadata = await getGroupMetadata(conn, m.chat)
    const schedule = createGroupSchedule({
      groupId: m.chat,
      mode,
      executeAt,
      createdBy: m.sender,
    })

    await m.reply([
      '╭─〔 USANAGI AUTO GROUP 〕',
      '│',
      `│ Status   : *TERJADWAL*`,
      `│ Action   : *${mode === 'closed' ? 'AUTO CLOSE' : 'AUTO OPEN'}*`,
      `│ Target   : *${metadata.subject || m.chat}*`,
      `│ Durasi   : *${formatDuration(duration)}*`,
      `│ Eksekusi : *${formatDate(schedule.executeAt, settings?.timezone)}*`,
      `│ ID       : *${schedule.id}*`,
      '│',
      `│ Cek      : *${usedPrefix}jadwalgrup*`,
      '│ Batal    : *${usedPrefix}deljadwal ID*',
      '╰────────────────',
    ].join('\n'))
  } catch (err) {
    await m.reply(`Jadwal gagal dibuat.\n\n${String(err?.message || err)}`)
  }
}

handler.command = /^(gcopen|gcclose|autoopen|autoclose|jadwalgrup|deljadwal)$/i
handler.help = ['gcopen', 'gcclose', 'autoopen', 'autoclose', 'jadwalgrup', 'deljadwal']
handler.menuHelp = ['gcopen', 'gcclose', 'autoopen', 'autoclose', 'jadwalgrup', 'deljadwal']
handler.tags = ['group']
handler.category = 'group'
handler.description = 'Mengatur buka, tutup, dan jadwal otomatis group'
handler.groupOnly = true

export default handler
