/**
 * Perintah Telegram. Semua handler memanggil service bersama (bukan data palsu).
 * Handler menerima `ctx` dari adapter: user/role sudah diverifikasi server.
 */
import crypto from 'node:crypto'
import { escapeHtml, createCallback } from './router.js'
import { can, permissionsOf } from '../roles.js'
import { audit } from '../audit.js'
import * as servers from '../servers.js'
import * as stock from '../stock.js'
import * as rpg from '../rpg.js'
import * as media from '../media.js'
import * as wa from '../wa.js'
import * as chats from '../chats.js'
import * as panel from '../panel-config.js'
import * as catalog from './catalog.js'
import { runPluginOnTelegram } from './plugin-bridge.js'
import { consumeLinkCode, whatsappJidFor, getUser } from '../identity.js'
import { errorSummaryText, recordError } from '../../error-hub.js'

const rupiah = value => Number(value || 0).toLocaleString('id-ID', { maximumFractionDigits: 2 })
const as = value => `$AS ${rupiah(value)}`
const bytes = value => {
  const n = Number(value || 0)
  if (n >= 1024 ** 3) return `${(n / 1024 ** 3).toFixed(2)} GB`
  if (n >= 1024 ** 2) return `${(n / 1024 ** 2).toFixed(1)} MB`
  if (n >= 1024) return `${(n / 1024).toFixed(0)} KB`
  return `${n} B`
}
const duration = ms => {
  const total = Math.max(0, Math.floor(Number(ms || 0) / 1000))
  const d = Math.floor(total / 86400)
  const h = Math.floor((total % 86400) / 3600)
  const m = Math.floor((total % 3600) / 60)
  return [d ? `${d}h` : '', h ? `${h}j` : '', `${m}m`].filter(Boolean).join(' ')
}
const roleBadge = role => ({ owner: '👑 owner', developer: '🛠 developer', admin: '🛡 admin', reseller: '🤝 reseller', user: '👤 user' }[role] || role)

function inline(rows) {
  return { inline_keyboard: rows }
}

/**
 * Tombol menu utama: fitur platform + kategori plugin WhatsApp (Game, RPG, Fun,
 * Maker, Stiker, Grup, Owner, ...). Satu aksi `menu.nav`, payload `view`.
 */
function menuKeyboard(ctx, router) {
  const row = (label, view) => ({ text: label, callback_data: `cb:${createCallback({ userId: ctx.userId, platform: 'telegram', platformUserId: ctx.platformUserId, action: 'menu.nav', payload: { view } })}` })
  const rows = []
  const platform = [
    ['📊 Status', 'status'],
    ['👤 Profil', 'profile'],
  ]
  if (router.allowed(ctx, 'saham')) platform.push(['💹 Saham', 'saham'])
  if (router.allowed(ctx, 'rpg')) platform.push(['🐉 RPG', 'rpg'])
  for (let index = 0; index < platform.length; index += 2) rows.push(platform.slice(index, index + 2).map(([label, view]) => row(label, view)))

  // Fitur populer: satu tombol per keluarga fitur (brat, unduh, musik, AI, …),
  // isinya opsi yang dijelaskan saat dibuka. Ini yang membuat menu ringkas.
  const popular = catalog.functions().slice(0, 8)
  const fnButtons = popular.map(entry => row(`${entry.icon} ${entry.label}`, `fn:${entry.id}`))
  for (let index = 0; index < fnButtons.length; index += 2) rows.push(fnButtons.slice(index, index + 2))

  // Kategori plugin lain (game, fun, tools, grup, …) — bila isinya masih ada.
  const priority = ['game', 'fun', 'maker', 'sticker', 'tools', 'group', 'owner', 'ai', 'downloader', 'economy']
  const all = catalog.categories()
  const shown = [...all].sort((a, b) => {
    const ai = priority.indexOf(a.id); const bi = priority.indexOf(b.id)
    return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi) || b.count - a.count
  }).slice(0, 6)
  const catButtons = shown.map(entry => row(`${entry.icon} ${entry.label}`, `cat:${entry.id}`))
  for (let index = 0; index < catButtons.length; index += 2) rows.push(catButtons.slice(index, index + 2))

  // "Dummy" kategori: fitur yang hanya bisa dipakai di WhatsApp. Ditampilkan
  // supaya pengguna tahu ke mana fitur yang mereka kenal dari bot WhatsApp,
  // bukan hilang tanpa penjelasan.
  const waOnlyCount = all.find(entry => entry.id === 'waonly')?.count || 0
  if (waOnlyCount) rows.push([row(`🔒 Khusus WhatsApp (${waOnlyCount})`, 'cat:waonly')])

  const extra = [row('📂 Semua Menu', 'allmenu'), row('❓ Bantuan', 'help')]
  if (router.allowed(ctx, 'jadibot')) extra.unshift(row('📱 Jadibot', 'jadibot'))
  if (router.allowed(ctx, 'tourl')) extra.unshift(row('🔗 To URL', 'tourl'))
  for (let index = 0; index < extra.length; index += 2) rows.push(extra.slice(index, index + 2))
  if (router.allowed(ctx, 'panel')) rows.push([row('🛠 Panel', 'panel'), row('🖥 Server', 'server')])
  if (router.allowed(ctx, 'admin')) rows.push([row('⚙️ Admin', 'admin'), row('🤝 Reseller', 'reseller')])
  return inline(rows)
}

/**
 * Tampilan satu keluarga fitur: setiap opsi (cara pakai berbeda) dijelaskan
 * satu baris, lengkap dengan tombol pilih.
 */
export async function sendFunction(ctx, groupId, page = 1) {
  const group = catalog.findFunction(groupId)
  if (!group) return ctx.send('Fitur itu tidak tersedia.')
  const PER_PAGE = 6
  const pages = Math.max(1, Math.ceil(group.options.length / PER_PAGE))
  const current = Math.min(Math.max(1, Math.floor(Number(page) || 1)), pages)
  const slice = group.options.slice((current - 1) * PER_PAGE, current * PER_PAGE)
  const lines = [
    `${group.icon} <b>${escapeHtml(group.label.toUpperCase())}</b>`,
    `<i>${escapeHtml(group.description)}</i>`,
    `<i>${group.options.length} opsi · halaman ${current}/${pages}</i>`,
    '',
  ]
  slice.forEach((option, index) => {
    lines.push(`<b>${(current - 1) * PER_PAGE + index + 1}.</b> <code>/${escapeHtml(option.command)}</code>`)
    lines.push(`   ${escapeHtml(option.description)}`)
  })
  lines.push('', '<i>Tekan tombol opsi untuk melihat cara pakainya, atau ketik perintahnya langsung.</i>')
  const nav = (label, target) => ({
    text: label,
    callback_data: `cb:${createCallback({ userId: ctx.userId, platform: 'telegram', platformUserId: ctx.platformUserId, action: 'menu.nav', payload: { view: `fn:${group.id}:${target}` } })}`,
  })
  const buttons = []
  const chooser = slice.map(option => ({
    text: `/${option.command}`,
    callback_data: `cb:${createCallback({ userId: ctx.userId, platform: 'telegram', platformUserId: ctx.platformUserId, action: 'menu.nav', payload: { view: `opt:${option.command}` } })}`,
  }))
  for (let index = 0; index < chooser.length; index += 3) buttons.push(chooser.slice(index, index + 3))
  if (pages > 1) buttons.push([...(current > 1 ? [nav('⬅️', current - 1)] : []), ...(current < pages ? [nav('➡️', current + 1)] : [])])
  buttons.push([{
    text: '📂 Kategori lain',
    callback_data: `cb:${createCallback({ userId: ctx.userId, platform: 'telegram', platformUserId: ctx.platformUserId, action: 'menu.nav', payload: { view: 'allmenu' } })}`,
  }])
  const rendered = await renderInPlace(ctx, lines.join('\n'), { reply_markup: inline(buttons) })
  if (rendered?.edited) return { edited: true, page: current, message_id: rendered.message_id }
  return rendered
}

export async function sendCategory(ctx, categoryId, page = 1) {
  const view = catalog.pageOf(categoryId, page)
  if (!view.total) return ctx.send('Kategori itu belum punya perintah.')
  const buttons = []
  if (view.pages > 1) {
    const nav = (label, target) => ({ text: label, callback_data: `cb:${createCallback({ userId: ctx.userId, platform: 'telegram', platformUserId: ctx.platformUserId, action: 'menu.nav', payload: { view: `cat:${categoryId}:${target}` } })}` })
    buttons.push([...(view.page > 1 ? [nav('⬅️', view.page - 1)] : []), ...(view.page < view.pages ? [nav('➡️', view.page + 1)] : [])])
  }
  buttons.push([{
    text: '📂 Kategori lain',
    callback_data: `cb:${createCallback({ userId: ctx.userId, platform: 'telegram', platformUserId: ctx.platformUserId, action: 'menu.nav', payload: { view: 'allmenu' } })}`,
  }])
  const keyboard = inline(buttons)
  // Ganti halaman = edit pesan yang sama, bukan mengirim pesan baru.
  const rendered = await renderInPlace(ctx, view.text, { reply_markup: keyboard })
  if (rendered?.edited) return { edited: true, page: view.page, message_id: rendered.message_id }
  return rendered
}

/** Deskripsi satu opsi: catatan FEATURE_GROUPS, atau bantuan plugin aslinya. */
function describeOption(command) {
  const item = catalog.findItem(command)
  const group = catalog.findFunction(command)
  const note = group?.options.find(option => option.command === command)?.description
  if (note) return { item, note }
  const usage = item?.usage?.[0] || command
  const desc = item?.description || ''
  return { item, note: desc || `Pakai: /${usage}` }
}

/** Kartu satu perintah: cara pakai + deskripsi + tombol jalankan. */
async function sendOption(ctx, command) {
  const name = String(command || '').toLowerCase()
  const found = catalog.findItem(name)
  if (!found) return ctx.send('Perintah itu tidak tersedia.')
  if (found.waOnly) {
    return renderInPlace(ctx, [
      `⛔ <b>/${escapeHtml(name)}</b> khusus WhatsApp`,
      '',
      found.waReason ? `Fitur ini ${escapeHtml(found.waReason)} — tidak bisa ditampilkan di Telegram.` : 'Fitur ini butuh kemampuan yang hanya ada di WhatsApp.',
      '',
      '<i>Fitur tetap tersedia di bot WhatsApp dan jadibot WA milikmu.</i>',
    ].join('\n'))
  }
  const { note } = describeOption(name)
  const group = catalog.findFunction(name)
  const usage = found.usage?.length ? found.usage : [name]
  const lines = [
    `🔧 <b>/${escapeHtml(name)}</b>`,
    group ? `<i>${escapeHtml(group.label)}</i>` : '',
    '',
    escapeHtml(note),
    '',
    '<b>Cara pakai</b>',
    ...usage.slice(0, 4).map(line => `<code>/${escapeHtml(String(line).replace(/^[/.]/, ''))}</code>`),
    '',
    `<i>Kategori: ${escapeHtml(found.category)}</i>`,
  ].filter(line => line !== '')
  const buttons = [[{
    text: '▶️ Jalankan',
    callback_data: `cb:${createCallback({ userId: ctx.userId, platform: 'telegram', platformUserId: ctx.platformUserId, action: 'menu.nav', payload: { view: `cmd:${name}:` } })}`,
  }]]
  if (group) {
    buttons[0].push({
      text: '↩️ Semua opsi',
      callback_data: `cb:${createCallback({ userId: ctx.userId, platform: 'telegram', platformUserId: ctx.platformUserId, action: 'menu.nav', payload: { view: `fn:${group.id}:1` } })}`,
    })
  }
  return renderInPlace(ctx, lines.join('\n'), { reply_markup: inline(buttons) })
}

async function statusText() {
  const main = wa.mainBotState()
  const sessions = wa.listSessions()
  const stockOk = stock.stockReady()
  const rpgStatus = rpg.storeStatus()
  const slots = servers.listSlots()
  const configured = slots.filter(slot => slot.configured)
  const lines = [
    '📊 <b>STATUS EKOSISTEM</b>',
    '',
    `<b>WhatsApp</b> · ${main.connected ? '🟢 terhubung' : main.registered ? '🟡 terdaftar / belum open' : '🔴 belum terdaftar'}`,
    `└ koneksi: <code>${main.connection}</code> · uptime ${duration(main.uptimeSeconds * 1000)}`,
    `└ sesi jadibot: <b>${sessions.length}</b>`,
    '',
    `<b>Telegram</b> · 🟢 adapter aktif`,
    `└ peran Anda: ${roleBadge(globalThis.__umiTelegramRole || 'user')}`,
    '',
    `<b>Saham (UMI TRADE)</b> · ${stockOk ? '🟢 siap' : '🔴 token game belum ada'}`,
    `<b>RPG</b> · ${rpgStatus.active ? `🟢 aktif · ${rpgStatus.canonicalUsers} profil` : '🔴 belum aktif'}`,
    `<b>Server</b> · ${configured.length}/${servers.MAX_SERVERS} slot terkonfigurasi`,
    '',
    `<i>Diperiksa ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB</i>`,
  ]
  return lines.join('\n')
}

/**
 * Kirim menu dengan banner video. Bila berkas banner belum ada di server atau
 * Telegram menolaknya, jatuh ke pesan teks biasa (kontrol tetap tampil).
 */
async function sendMenu(ctx, router, caption) {
  const keyboard = menuKeyboard(ctx, router)
  if (typeof ctx.sendBanner === 'function') {
    try {
      // Banner dikirim tanpa tombol: tombol tinggal di pesan teks supaya saat
      // halaman diganti, pesan itu bisa diedit (caption video dibatasi 1024
      // karakter dan tidak bisa diganti jadi teks biasa).
      const result = await ctx.sendBanner({ caption: '🌙 <b>Usanagi Umi AI</b>' })
      if (result?.sent) {
        await ctx.send(caption, { reply_markup: keyboard })
        return result
      }
    } catch (error) {
      // Banner bersifat dekoratif: jangan sampai menu ikut gagal.
      audit({ actorUserId: ctx.userId, platform: 'telegram', platformUserId: ctx.platformUserId, action: 'telegram.banner.failed', result: 'failed', meta: { error: String(error.message || error).slice(0, 160) } })
    }
  }
  return ctx.send(caption, { reply_markup: keyboard })
}

/**
 * Bungkus ctx untuk navigasi menu: balasan pertama mengedit pesan yang tombolnya
 * ditekan, bukan mengirim pesan baru. Kalau edit gagal (pesan dihapus / terlalu
 * lama / bukan teks), barulah pesan baru dikirim supaya pengguna tetap dapat
 * jawaban.
 */
async function renderInPlace(ctx, text, options = {}) {
  const body = String(text || '')
  if (ctx.callbackMessageId && typeof ctx.edit === 'function' && body.length <= 4096) {
    try {
      const result = await ctx.edit(ctx.callbackMessageId, body, options)
      return { edited: true, message_id: ctx.callbackMessageId, result }
    } catch (error) {
      // Menu lama (banner video) tidak punya teks — coba ganti caption.
      if (typeof ctx.editCaption === 'function' && body.length <= 1024 && /no text|caption|not modified/i.test(String(error.message))) {
        try {
          const result = await ctx.editCaption(ctx.callbackMessageId, body, options)
          return { edited: true, caption: true, message_id: ctx.callbackMessageId, result }
        } catch {}
      }
      audit({
        actorUserId: ctx.userId, platform: 'telegram', platformUserId: ctx.platformUserId,
        action: 'telegram.menu.edit', result: 'failed',
        meta: { error: String(error?.message || error).slice(0, 120) },
      })
    }
  }
  return ctx.send(body, options)
}

export function withEditInPlace(ctx) {
  let edited = false
  const wrapped = Object.create(ctx)
  wrapped.send = async (text, options) => {
    if (!edited) {
      edited = true
      return renderInPlace(ctx, text, options)
    }
    return ctx.send(text, options)
  }
  return wrapped
}

export function registerCommands(router, { publicBaseUrl = '', logger = console } = {}) {
  const define = (name, config) => router.register({ name, ...config })

  define('start', {
    description: 'Mulai bot & tampilkan menu',
    handler: async (ctx) => {
      await sendMenu(ctx, router, [
        '🌙 <b>Usanagi Umi AI · Multi-App</b>',
        '',
        `Halo <b>${escapeHtml(ctx.displayName || ctx.username || 'kamu')}</b>!`,
        'Satu ekosistem, dua antarmuka: WhatsApp + Telegram.',
        '',
        'Pilih menu di bawah, atau ketik /help untuk panduan.',
      ].join('\n'))
    },
  })

  define('menu', {
    description: 'Menu utama & menu kategori (game, fun, maker, stiker, grup, owner, …)',
    handler: async (ctx, parsed = { args: [] }) => {
      const wanted = parsed.args?.[0]
      if (wanted) {
        const page = Number(parsed.args?.[1]) || 1
        const categoryId = catalog.resolveCategory(wanted)
        if (categoryId) return sendCategory(ctx, categoryId, page)
        // Bukan kategori? coba jalankan sebagai perintah plugin.
        const direct = await runPluginOnTelegram(ctx, { name: String(wanted).toLowerCase().replace(/^\//, ''), args: parsed.args.slice(1) })
        if (direct.handled) return direct
        return ctx.send(`Kategori <b>${escapeHtml(wanted)}</b> tidak ada. Lihat <code>/allmenu</code>.`)
      }

      const cats = catalog.categories()
      const totalPlugins = catalog.catalog().total
      const counts = { public: 0, privileged: 0 }
      for (const item of router.list()) counts[router.allowed(ctx, item.name) ? 'public' : 'privileged'] += 1
      return sendMenu(ctx, router, [
        '🌙 <b>MENU UTAMA</b>',
        '',
        `Peran : ${roleBadge(ctx.role)}`,
        `Fitur platform : <b>${counts.public}</b> perintah`,
        `Fitur WhatsApp : <b>${totalPlugins}</b> perintah dalam ${cats.length} kategori`,
        '',
        '<b>Kategori</b>',
        ...cats.slice(0, 12).map(entry => `${entry.icon} ${entry.label} <i>(${entry.count})</i>`),
        '',
        'Tekan tombol di bawah, atau <code>/menu game</code>, <code>/menu stiker</code>, …',
      ].join('\n'))
    },
  })

  define('allmenu', {
    description: 'Semua perintah, dikelompokkan per kategori',
    handler: async (ctx) => {
      const cats = catalog.categories()
      if (!cats.length) return ctx.send('⚠️ Katalog plugin belum dimuat. Coba lagi sebentar lagi.')
      const lines = ['📂 <b>SEMUA MENU</b>', '', `<i>${catalog.catalog().total} perintah dari plugin WhatsApp</i>`, '']
      for (const entry of cats) lines.push(`${entry.icon} <b>${entry.label}</b> (${entry.count}) → <code>/menu ${entry.id}</code>`)
      lines.push('', 'Cari cepat: <code>/cari kata</code> · Contoh: <code>/cari sticker</code>')
      return ctx.send(lines.join('\n'))
    },
  })

  define('cari', {
    description: 'Cari perintah berdasarkan nama atau kegunaan',
    handler: async (ctx, parsed) => {
      const term = (parsed.args || []).join(' ').trim()
      if (!term) return ctx.send('Format: <code>/cari sticker</code>')
      const found = catalog.search(term, { limit: 20 })
      if (!found.length) return ctx.send(`Tidak ada perintah yang cocok dengan <b>${escapeHtml(term)}</b>.`)
      return ctx.send([
        `🔍 <b>HASIL: ${escapeHtml(term)}</b>`,
        `<i>${found.length} perintah</i>`, '',
        ...found.map(item => catalog.formatItem(item)),
        '', 'Jalankan dengan mengetik perintahnya (awalan <code>/</code>).',
      ].join('\n'))
    },
  })

  define('help', {
    description: 'Panduan perintah',
    handler: async (ctx) => {
      await ctx.send([
        '❓ <b>PANDUAN</b>',
        '',
        '<b>Umum</b>',
        '/start — sambutan',
        '/menu — menu tombol (semua kategori)',
        '/menu game | stiker | maker | fun | grup | owner | ai | alat — daftar perintah',
        '/allmenu — semua kategori sekaligus',
        '/cari <kata> — cari perintah',
        '/profile — identitas & tautan akun',
        '/status — status nyata layanan',
        '/link KODE — tautkan akun web ke Telegram',
        '/tourl — kirim foto/video, dapat tautan permanen',
        '/files — daftar & hapus berkas media saya',
        '/health — kesehatan integrasi',
        '',
        '<b>Layanan</b>',
        '/jadibot — sesi WhatsApp milikmu',
        '/saham — pasar, portofolio, beli/jual',
        '/rpg — hub RPG (profil, inventori, kerja, harian, tebak, peringkat)',
        '/rpg <game> — main game RPG, contoh /rpg mancing, /rpg mining, /rpg dungeon',
        '',
        '<b>Pengelola</b>',
        '/server — status & kontrol server (allowlist)',
        '/admin — bot Telegram, pengguna, audit',
        '/reseller — ringkasan reseller',
        '/panel — atur panel hosting (owner/developer): set url|ptlc|ptla|server, test',
        '/fitur — semua plugin WhatsApp yang bisa dipakai di sini',
      ].join('\n'))
    },
  })

  define('status', {
    description: 'Status layanan',
    handler: async (ctx) => {
      await ctx.send(await statusText())
    },
  })

  define('profile', {
    description: 'Profil & tautan akun',
    permission: null,
    handler: async (ctx) => {
      const jid = whatsappJidFor(ctx.userId)
      const identity = rpg.rpgJidFor(ctx.userId, ctx.platformUserId)
      const user = getUser(ctx.userId)
      const lines = [
        '👤 <b>PROFIL</b>',
        '',
        `Nama    : <b>${escapeHtml(ctx.displayName || '-')}</b>`,
        `Peran   : ${roleBadge(ctx.role)}`,
        `ID int. : <code>${escapeHtml(ctx.userId)}</code>`,
        `Telegram: <code>${escapeHtml(ctx.platformUserId)}</code>${ctx.username ? ` · @${escapeHtml(ctx.username)}` : ''}`,
        `WhatsApp: ${jid ? `<code>${jid.replace(/(\d{4})\d+(\d{3})/, '$1***$2')}</code> · tertaut` : '🔴 belum tertaut (opsional di Telegram)'}`,
        `RPG ID  : <code>${escapeHtml(String(identity.jid || '-').replace('@s.whatsapp.net', ''))}</code>`,
        '',
      ]
      const profile = identity.jid ? rpg.profile(identity.jid) : { hasProfile: false }
      if (profile.hasProfile) {
        lines.push('<b>RPG</b>', `Level ${profile.level} · ${rupiah(profile.exp)} EXP · ${rupiah(profile.koin)} koin`, `Inventori: ${profile.inventoryCount} jenis (${rupiah(profile.totalItems)} item)`)
      } else {
        lines.push('<i>Belum ada progres RPG. Buat dengan <code>/rpg mulai</code> — tidak perlu nomor WhatsApp.</i>')
      }
      lines.push('', `Izin: <code>${permissionsOf(ctx.role).length}</code> aktif`)
      await ctx.send(lines.join('\n'))
    },
  })

  define('link', {
    description: 'Tautkan akun web (kode sekali pakai)',
    sensitive: true,
    handler: async (ctx, parsed) => {
      const code = parsed.args[0]
      if (!code) return ctx.send('Cara pakai: <code>/link UMI-XXXX-XXXX</code>\nBuat kode di dashboard web → menu <b>Tautkan Telegram</b>.')
      const result = consumeLinkCode(code, {
        platform: 'telegram', platformUserId: ctx.platformUserId, username: ctx.username,
      })
      await ctx.refreshIdentity()
      const jid = whatsappJidFor(result.user.id)
      await ctx.send([
        '✅ <b>Akun tertaut</b>',
        '',
        `Peran baru: ${roleBadge(result.user.role)}`,
        jid ? `WhatsApp: <code>${jid.replace(/(\d{4})\d+(\d{3})/, '$1***$2')}</code>` : 'WhatsApp: belum ada nomor pada akun ini',
        '',
        'Sekarang progres RPG, saham, dan sesi jadibot mengikuti akun web tersebut.',
      ].join('\n'), { reply_markup: menuKeyboard(ctx, router) })
    },
  })

  /* ─────────────── JADIBOT ─────────────── */
  define('jadibot', {
    description: 'Kelola sesi WhatsApp milikmu',
    permission: 'session.own',
    handler: async (ctx, parsed) => {
      const sub = String(parsed.args[0] || 'list').toLowerCase()
      const jid = whatsappJidFor(ctx.userId)
      const sessions = wa.sessionsForUser(ctx.userId, jid)
      const limit = wa.sessionLimits(ctx.role)

      if (sub === 'list' || sub === 'status') {
        const lines = ['📱 <b>JADIBOT WHATSAPP</b>', '', `Sesi kamu: <b>${sessions.length}</b> / batas ${limit}`, '']
        if (!sessions.length) {
          lines.push('<i>Belum ada sesi.</i>', '', 'Buat sesi lewat dashboard web → Jadibot, lalu pindai QR di sana.')
        } else {
          for (const row of sessions) lines.push(`• <code>${row.masked}</code> · ${row.email || 'tanpa email'} · dibuat ${row.createdAt ? new Date(row.createdAt).toLocaleDateString('id-ID') : '-'}`)
          lines.push('', 'Hentikan: /jadibot stop &lt;nomor&gt;')
        }
        return ctx.send(lines.join('\n'))
      }

      if (sub === 'stop') {
        const number = String(parsed.args[1] || '').replace(/\D/g, '')
        const owned = sessions.find(row => row.number === number)
        if (!owned) return ctx.send('❌ Nomor itu bukan sesi milikmu.')
        const token = createCallback({ userId: ctx.userId, platform: 'telegram', platformUserId: ctx.platformUserId, action: 'jadibot.stop', payload: { number } })
        return ctx.send(`Hentikan sesi <code>${owned.masked}</code>?\nSesi berhenti tapi file sesi tetap ada.`, {
          reply_markup: inline([[{ text: '⏹ Hentikan', callback_data: `cb:${token}` }, { text: 'Batal', callback_data: `cb:${createCallback({ userId: ctx.userId, platform: 'telegram', platformUserId: ctx.platformUserId, action: 'menu.nav', payload: { view: 'jadibot' } })}` }]]),
        })
      }
      await ctx.send('Pilihan: <code>/jadibot list</code> atau <code>/jadibot stop &lt;nomor&gt;</code>')
    },
  })

  /* ─────────────── SERVER ─────────────── */
  define('server', {
    description: 'Status & kontrol server (allowlist)',
    permission: 'server.read',
    sensitive: true,
    handler: async (ctx, parsed) => {
      const sub = String(parsed.args[0] || 'list').toLowerCase()
      const slots = servers.listSlots()

      if (sub === 'list' || !sub) {
        const lines = ['🖥 <b>SERVER SLOTS</b>', '', `Terpakai: ${slots.filter(s => s.configured).length}/${servers.MAX_SERVERS} · slot kosong tidak dipantau`, '']
        for (const slot of slots) {
          lines.push(slot.configured
            ? `<b>${slot.slot}</b>. ${escapeHtml(slot.name || 'tanpa nama')} · ${escapeHtml(slot.host)}`
            : `<b>${slot.slot}</b>. <i>kosong</i>`)
        }
        lines.push('', 'Detail: /server status &lt;slot&gt; · log: /server logs &lt;slot&gt;')
        if (can(ctx.role, 'server.control')) lines.push('Kontrol: /server restart &lt;slot&gt;')
        return ctx.send(lines.join('\n'))
      }

      if (!['status', 'logs', 'start', 'stop', 'restart'].includes(sub)) {
        return ctx.send('Aksi tidak dikenal. Pilihan: <code>list, status, logs, start, stop, restart</code>.')
      }
      const slotNumber = Number(parsed.args[1])
      if (!Number.isInteger(slotNumber) || slotNumber < 1 || slotNumber > servers.MAX_SERVERS) {
        return ctx.send(`Slot harus 1–${servers.MAX_SERVERS}. Contoh: <code>/server ${sub} 1</code>`)
      }
      const slot = servers.getSlot(slotNumber)
      if (!slot.configured) return ctx.send(`Slot <b>${slotNumber}</b> belum dikonfigurasi — tidak ada server yang bisa diperiksa.`)

      if (sub === 'status') {
        const status = await servers.serverStatus(slotNumber)
        const usage = status.usage || {}
        if (status.status === 'empty') return ctx.send(status.message)
        return ctx.send([
          `🖥 <b>${escapeHtml(status.name || `Server ${slotNumber}`)}</b>`,
          '',
          `Status  : <b>${escapeHtml(status.status)}</b> ${status.online ? '🟢' : '🔴'}`,
          status.latencyMs ? `Latensi : ${status.latencyMs} ms` : null,
          usage.uptimeMs ? `Uptime  : ${duration(usage.uptimeMs)}` : null,
          usage.cpuPercent !== undefined ? `CPU     : ${usage.cpuPercent.toFixed(1)}%` : null,
          usage.memoryBytes !== undefined ? `RAM     : ${bytes(usage.memoryBytes)}` : null,
          usage.diskBytes !== undefined ? `Disk    : ${bytes(usage.diskBytes)}` : null,
          status.message ? `\n<i>${escapeHtml(status.message)}</i>` : null,
          '',
          `<i>Sumber: ${escapeHtml(status.source || 'panel-api')} · ${new Date(status.checkedAt).toLocaleString('id-ID')}</i>`,
        ].filter(Boolean).join('\n'))
      }

      if (sub === 'logs') {
        const result = await servers.serverAction(slotNumber, 'logs', { actor: ctx.actor, role: ctx.role })
        const text = result.lines.length ? result.lines.join('\n') : '(log kosong)'
        return ctx.send(`📜 <b>Log server ${slotNumber}</b>\n<pre>${escapeHtml(text.slice(-3500))}</pre>`)
      }

      // start/stop/restart → konfirmasi dua langkah
      if (!can(ctx.role, 'server.control')) return ctx.send('⛔ Peran kamu tidak boleh mengontrol server.')
      const token = createCallback({
        userId: ctx.userId, platform: 'telegram', platformUserId: ctx.platformUserId,
        action: 'server.action', payload: { slot: slotNumber, action: sub },
      })
      return ctx.send(`⚠️ Jalankan <b>${sub}</b> pada server <b>${escapeHtml(slot.name || String(slotNumber))}</b>?`, {
        reply_markup: inline([[
          { text: `✅ Ya, ${sub}`, callback_data: `cb:${token}` },
          { text: 'Batal', callback_data: `cb:${createCallback({ userId: ctx.userId, platform: 'telegram', platformUserId: ctx.platformUserId, action: 'menu.nav', payload: { view: 'server' } })}` },
        ]]),
      })
    },
  })

  /* ─────────────── SAHAM ─────────────── */
  define('saham', {
    description: 'Pasar saham & portofolio (data UMI TRADE yang sama dengan website)',
    permission: 'stock.read',
    handler: async (ctx, parsed) => {
      const args = parsed.args || []
      const sub = String(args[0] || 'pasar').toLowerCase()
      // Nomor trading: WhatsApp tertaut bila ada, kalau tidak nomor platform
      // Telegram (auto-register lewat /api/trading/bot/register di backend).
      const identity = rpg.rpgJidFor(ctx.userId, ctx.platformUserId)
      const number = String(identity.jid || '').replace(/\D/g, '')
      const nav = (label, view) => ({ text: label, callback_data: `cb:${createCallback({ userId: ctx.userId, platform: 'telegram', platformUserId: ctx.platformUserId, action: 'menu.nav', payload: { view } })}` })
      const navRow = [
        nav('💼 Portofolio', 'cmd:saham:me'),
        nav('🏆 Top trader', 'cmd:saham:top'),
      ]

      /* Pasar: daftar harga nyata dari API */
      if (sub === 'pasar' || sub === 'market') {
        let data
        try {
          data = await stock.market()
        } catch (error) {
          return ctx.send(`🔴 <b>Pasar saham tidak bisa diambil</b>\n\n<code>${escapeHtml(String(error.message || error).slice(0, 200))}</code>\n\n<i>Data tidak dikarang. Coba lagi nanti.</i>`, { reply_markup: inline([navRow]) })
        }
        if (!data.stocks.length) {
          return ctx.send('🟡 API saham membalas, tetapi daftar emiten kosong. Coba lagi nanti.', { reply_markup: inline([navRow]) })
        }
        const movers = [...data.stocks].sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent)).slice(0, 12)
        const lines = [
          '💹 <b>PASAR UMI TRADE</b>',
          data.session ? `Sesi: ${data.session.open ? '🟢 buka' : '🔴 tutup'} · ${escapeHtml(data.session.label || '')} (${escapeHtml(data.session.timezone || '-')})` : null,
          `<i>${data.stocks.length} emiten · diambil ${new Date(data.fetchedAt).toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB</i>`,
          '',
        ].filter(Boolean)
        for (const item of movers) {
          const arrow = item.changePercent > 0 ? '🟢▲' : item.changePercent < 0 ? '🔴▼' : '⚪️'
          lines.push(`${arrow} <b>${escapeHtml(item.symbol)}</b> · ${as(item.price)} · ${item.changePercent >= 0 ? '+' : ''}${item.changePercent.toFixed(2)}%`)
        }
        lines.push('', 'Detail satu emiten: <code>/saham BBCA</code>')
        lines.push('Beli/jual: <code>/saham beli BBCA 1</code>')
        return ctx.send(lines.join('\n'), { reply_markup: inline([navRow]) })
      }

      /* Detail satu emiten */
      if (/^[a-z]{2,6}$/i.test(sub) && !['me', 'top', 'beli', 'jual', 'help', 'bantuan', 'sahamku'].includes(sub)) {
        const data = await stock.market()
        const item = data.stocks.find(row => row.symbol === sub.toUpperCase())
        if (!item) return ctx.send(`Emiten <b>${escapeHtml(sub.toUpperCase())}</b> tidak ada di daftar.`, { reply_markup: inline([navRow]) })
        return ctx.send([
          `💹 <b>${escapeHtml(item.symbol)}</b> — ${escapeHtml(item.name || '-')}`,
          item.sector ? `<i>${escapeHtml(item.sector)}</i>` : '',
          '',
          `Harga    : <b>${as(item.price)}</b>`,
          `Perubahan: ${item.changePercent >= 0 ? '🟢 +' : '🔴 '}${item.changePercent.toFixed(2)}% (${as(item.change)})`,
          item.high !== null ? `Tertinggi: ${as(item.high)}` : '',
          item.low !== null ? `Terendah : ${as(item.low)}` : '',
          `Volume   : ${rupiah(item.volume)}`,
          '',
          `<code>/saham beli ${item.symbol} 1</code> · <code>/saham jual ${item.symbol} 1</code>`,
        ].filter(Boolean).join('\n'), { reply_markup: inline([navRow]) })
      }

      if (sub === 'me' || sub === 'portofolio' || sub === 'sahamku') {
        if (!number) return ctx.send('🔴 Identitas trading tidak tersedia untuk akun ini.')
        let me
        try {
          me = await stock.portfolio(number)
        } catch (error) {
          return ctx.send(`🔴 Portofolio tidak bisa dibuka.\n<code>${escapeHtml(String(error.message || error).slice(0, 200))}</code>`)
        }
        const summary = me.summary || me.user || me
        const positions = Array.isArray(summary.positions) ? summary.positions : (Array.isArray(me.positions) ? me.positions : [])
        const lines = [
          '💼 <b>PORTOFOLIO</b>', '',
          `Kas      : ${as(summary.balance ?? summary.cash)}`,
          `Saham    : ${as(summary.equity ?? summary.stockValue)}`,
          `Total    : <b>${as(summary.netWorth ?? summary.total)}</b>`,
          `P/L      : ${Number(summary.pl ?? summary.profit ?? 0) >= 0 ? '🟢 +' : '🔴 '}${as(summary.pl ?? summary.profit ?? 0)}`,
          summary.rank ? `Peringkat: #${summary.rank}${summary.total ? ` / ${summary.total}` : ''}` : '',
        ].filter(Boolean)
        if (positions.length) {
          lines.push('', '<b>Posisi</b>')
          for (const pos of positions.slice(0, 10)) {
            const qty = Number(pos.lots ?? pos.qty ?? pos.amount ?? 0)
            lines.push(`• <b>${escapeHtml(String(pos.symbol || pos.sym || '').toUpperCase())}</b> ${rupiah(qty)} lot @ ${as(pos.avgPrice ?? pos.avg ?? 0)} · ${as(pos.value ?? pos.marketValue ?? 0)}`)
          }
        } else lines.push('', '<i>Belum punya saham. Mulai dengan /saham beli KODE LOT.</i>')
        return ctx.send(lines.join('\n'), { reply_markup: inline([[nav('💹 Pasar', 'cmd:saham:pasar'), nav('🏆 Top trader', 'cmd:saham:top')]]) })
      }

      if (sub === 'top' || sub === 'peringkat') {
        const rows = await stock.leaderboard(10)
        const lines = ['🏆 <b>TRADER TERATAS</b>', '', '<i>Sumber: API UMI TRADE (sama dengan website)</i>', '']
        if (!rows.length) lines.push('<i>Belum ada data trader.</i>')
        rows.forEach((row, index) => lines.push(`${row.rank || index + 1}. ${escapeHtml(String(row.username))} · ${as(row.netWorth)}${row.pl ? ` · ${row.pl >= 0 ? '+' : ''}${as(row.pl)}` : ''}`))
        return ctx.send(lines.join('\n'), { reply_markup: inline([navRow]) })
      }

      if (sub === 'beli' || sub === 'jual' || sub === 'buy' || sub === 'sell') {
        const side = ['beli', 'buy'].includes(sub) ? 'buy' : 'sell'
        return tradePrompt(ctx, { side, args: args.slice(1), number })
      }

      return ctx.send([
        '💹 <b>SAHAM</b>', '',
        '/saham — harga pasar',
        '/saham BBCA — detail emiten',
        '/saham me — portofolio',
        '/saham top — peringkat trader',
        '/saham beli &lt;KODE&gt; &lt;lot&gt;',
        '/saham jual &lt;KODE&gt; &lt;lot&gt;',
      ].join('\n'), { reply_markup: inline([navRow]) })
    },
  })

  async function tradePrompt(ctx, { side, args, number }) {
    if (!number) return ctx.send('🔴 Identitas trading tidak tersedia untuk akun ini.')
    const symbol = String(args[0] || '').toUpperCase()
    const lots = Number(args[1])
    if (!/^[A-Z0-9]{2,12}$/.test(symbol) || !Number.isInteger(lots) || lots <= 0) {
      return ctx.send(`Format: <code>/saham ${side} KODE LOT</code>\nContoh: <code>/saham ${side} UMI 5</code>`)
    }
    if (!can(ctx.role, 'stock.trade')) return ctx.send('⛔ Peran kamu tidak boleh bertransaksi.')
    const token = createCallback({
      userId: ctx.userId, platform: 'telegram', platformUserId: ctx.platformUserId,
      action: 'stock.trade', payload: { side, symbol, lots, number },
    })
    return ctx.send(`⚠️ Konfirmasi ${side === 'buy' ? 'BELI' : 'JUAL'} <b>${lots}</b> lot <b>${escapeHtml(symbol)}</b>?\nOrder dieksekusi backend UMI TRADE dengan validasi saldo.`, {
      reply_markup: inline([[
        { text: '✅ Konfirmasi', callback_data: `cb:${token}` },
        { text: 'Batal', callback_data: `cb:${createCallback({ userId: ctx.userId, platform: 'telegram', platformUserId: ctx.platformUserId, action: 'menu.nav', payload: { view: 'saham' } })}` },
      ]]),
    })
  }

  /* ─────────────── RPG ─────────────── */
  define('rpg', {
    description: 'Profil, inventori, game & hadiah harian',
    permission: 'rpg.read',
    handler: async (ctx, parsed) => {
      const rawSub = String(parsed.args[0] || '').toLowerCase()
      const sub = rawSub || 'hub'
      const identity = rpg.rpgJidFor(ctx.userId, ctx.platformUserId)
      const jid = identity.jid
      if (!jid) return ctx.send('🎮 Identitas RPG tidak tersedia. Coba lagi dari akun Telegram ini.')

      const identityNote = identity.source === 'whatsapp'
        ? '<i>Terhubung ke nomor WhatsApp kamu — progres sama dengan bot WhatsApp.</i>'
        : `<i>Profil Telegram (nomor platform <code>${jid.replace('@s.whatsapp.net', '')}</code>). Tautkan WhatsApp di /panel untuk menyatukan progres.</i>`

      /* HUB: profil ringkas + tombol + daftar game RPG dari plugin WhatsApp */
      if (sub === 'hub') {
        const profile = rpg.profile(jid)
        const rpgItems = catalog.itemsOf('rpg')
        const picked = ['kerja', 'mancing', 'mining', 'berburu', 'dungeon', 'berkebon', 'nambalban', 'ngojek', 'ngamen', 'curi', 'maling', 'berdagang']
        const playable = picked
          .filter(name => catalog.findItem(name))
          .filter((name, index, list) => list.indexOf(name) === index)
          .slice(0, 10)
        return ctx.send([
          '🐉 <b>RPG · HUB</b>',
          '',
          profile.hasProfile
            ? `Level <b>${Number(profile.level) || 1}</b> · ${rupiah(profile.exp)} EXP · <b>${rupiah(profile.koin)}</b> koin · ${Number(profile.inventoryCount) || 0} jenis item`
            : '<i>Belum ada profil — otomatis dibuat saat kamu mulai bermain.</i>',
          '',
          '<b>Perintah inti</b>',
          '/rpg profil · /rpg inv · /rpg top',
          '/rpg kerja — cari koin (30 menit)',
          '/rpg harian — hadiah harian',
          '/rpg tebak — mini game angka',
          '',
          '<b>Game RPG (pakai engine yang sama)</b>',
          playable.length
            ? playable.map(name => `/${name}`).join(' · ')
            : '<i>Plugin RPG belum termuat di proses ini.</i>',
          `Total perintah RPG: <b>${rpgItems.length}</b> → <code>/menu rpg</code>`,
          '',
          '<i>Ketik /rpg &lt;nama game&gt;, contoh: /rpg mancing</i>',
          identityNote,
        ].join('\n'), {
          reply_markup: inline([
            [
              { text: '👤 Profil', callback_data: `cb:${createCallback({ userId: ctx.userId, platform: 'telegram', platformUserId: ctx.platformUserId, action: 'menu.nav', payload: { view: 'cmd:rpg:profil' } })}` },
              { text: '🎒 Inventori', callback_data: `cb:${createCallback({ userId: ctx.userId, platform: 'telegram', platformUserId: ctx.platformUserId, action: 'menu.nav', payload: { view: 'cmd:rpg:inv' } })}` },
            ],
            [
              { text: '🎁 Harian', callback_data: `cb:${createCallback({ userId: ctx.userId, platform: 'telegram', platformUserId: ctx.platformUserId, action: 'menu.nav', payload: { view: 'cmd:rpg:harian' } })}` },
              { text: '🏆 Peringkat', callback_data: `cb:${createCallback({ userId: ctx.userId, platform: 'telegram', platformUserId: ctx.platformUserId, action: 'menu.nav', payload: { view: 'cmd:rpg:top' } })}` },
            ],
            [
              { text: '🎮 Semua game RPG', callback_data: `cb:${createCallback({ userId: ctx.userId, platform: 'telegram', platformUserId: ctx.platformUserId, action: 'menu.nav', payload: { view: 'cat:rpg' } })}` },
            ],
          ]),
        })
      }

      /* /rpg <nama plugin> → jalankan plugin RPG WhatsApp (data sama) */
      if (!['profil', 'profile', 'inv', 'inventory', 'top', 'peringkat', 'daily', 'harian', 'kerja', 'work', 'tebak', 'guess', 'mulai', 'daftar', 'start'].includes(sub)) {
        const direct = await runPluginOnTelegram(ctx, { name: rawSub, args: (parsed.args || []).slice(1) })
        if (direct.handled) return direct
        return ctx.send(`Game <b>${escapeHtml(rawSub)}</b> tidak ditemukan. Lihat <code>/menu rpg</code> untuk daftar lengkap.`)
      }

      /* mulai / daftar — buat profil di engine yang sama */
      if (sub === 'mulai' || sub === 'daftar' || sub === 'start') {
        const created = await rpg.ensureProfile(jid, { idempotencyKey: `${ctx.platformUserId}:${Math.floor(Date.now() / 60000)}` })
        const profile = rpg.profile(jid)
        return ctx.send([
          created.created ? '✅ <b>Profil RPG dibuat</b>' : 'ℹ️ <b>Profil RPG kamu sudah ada</b>',
          '',
          `Level : <b>${profile.level || 1}</b>`,
          `Koin  : ${rupiah(profile.koin || 0)}`,
          `EXP   : ${rupiah(profile.exp || 0)}`,
          '',
          'Lanjut: <code>/rpg harian</code> · <code>/rpg kerja</code> · <code>/rpg tebak</code> · <code>/rpg inv</code>',
          identityNote,
        ].join('\n'))
      }

      if (sub === 'profil' || sub === 'profile') {
        let profile = rpg.profile(jid)
        if (!profile.hasProfile) {
          // Profil dibuat otomatis (idempoten) supaya pengguna Telegram bisa
          // langsung main tanpa langkah tambahan.
          await rpg.ensureProfile(jid, { idempotencyKey: `${ctx.platformUserId}:init` })
          profile = rpg.profile(jid)
        }
        if (!profile.hasProfile) {
          return ctx.send('🎮 Profil RPG belum bisa dibuat. Coba <code>/rpg mulai</code> lagi.')
        }
        const r = profile.rpg || {}
        return ctx.send([
          '🎮 <b>PROFIL RPG</b>', '',
          `Level    : <b>${profile.level}</b>`,
          `EXP      : ${rupiah(profile.exp)}`,
          `Koin     : ${rupiah(profile.koin)}`,
          `HP/Mana  : ${r.health ?? '-'}/${r.maxHealth ?? '-'} · ${r.mana ?? '-'}/${r.maxMana ?? '-'}`,
          `Pet      : ${r.pet ? escapeHtml(r.pet.name || r.pet.type || 'ada') : '-'}`,
          `Inventori: ${profile.inventoryCount} jenis · ${rupiah(profile.totalItems)} item`,
          '', identityNote,
        ].join('\n'))
      }

      if (sub === 'inv' || sub === 'inventory') {
        const profile = rpg.profile(jid)
        if (!profile.hasProfile) return ctx.send('🎒 Belum ada profil. Mulai dengan <code>/rpg mulai</code>.')
        const lines = ['🎒 <b>INVENTORI</b>', '']
        if (!profile.inventory.length) lines.push('<i>Kosong.</i>')
        for (const item of profile.inventory) lines.push(`• ${escapeHtml(item.item)} × ${rupiah(item.count)}`)
        if (profile.inventoryCount > profile.inventory.length) lines.push(`… dan ${profile.inventoryCount - profile.inventory.length} jenis lain`)
        return ctx.send(lines.join('\n'))
      }

      if (sub === 'top' || sub === 'peringkat') {
        const rows = rpg.leaderboard({ limit: 10, by: parsed.args[1] === 'exp' ? 'exp' : 'koin' })
        const lines = [`🏆 <b>PERINGKAT RPG (${parsed.args[1] === 'exp' ? 'EXP' : 'KOIN'})</b>`, '']
        rows.forEach(row => lines.push(`${row.rank}. ${row.masked} · Lv ${row.level} · ${rupiah(row.koin)} koin`))
        if (!rows.length) lines.push('<i>Belum ada data.</i>')
        return ctx.send(lines.join('\n'))
      }

      /* Game: hadiah harian (konfirmasi tombol) */
      if (sub === 'daily' || sub === 'harian') {
        if (!rpg.profile(jid).hasProfile) return ctx.send('Buat profil dulu: <code>/rpg mulai</code>.')
        const token = createCallback({ userId: ctx.userId, platform: 'telegram', platformUserId: ctx.platformUserId, action: 'rpg.daily', payload: { jid } })
        return ctx.send(`🎁 Klaim hadiah harian: <b>${rpg.DAILY.koin}</b> koin + <b>${rpg.DAILY.exp}</b> EXP?\nCooldown ${Math.round(rpg.DAILY.cooldownMs / 3600000)} jam.`, {
          reply_markup: inline([[{ text: '🎁 Klaim', callback_data: `cb:${token}` }]]),
        })
      }

      /* Game: kerja (langsung, cooldown 30 menit) */
      if (sub === 'kerja' || sub === 'work') {
        if (!rpg.profile(jid).hasProfile) return ctx.send('Buat profil dulu: <code>/rpg mulai</code>.')
        const result = await rpg.work(jid, { idempotencyKey: `${ctx.platformUserId}:${Math.floor(Date.now() / 30000)}` })
        if (result.ok) {
          return ctx.send([
            '🛠 <b>KERJA</b>', '',
            `+${rupiah(result.koin)} koin · +${rupiah(result.exp)} EXP`,
            `Total: <b>${rupiah(result.totalKoin)}</b> koin`,
            '', `<i>Bisa kerja lagi dalam ${Math.round(rpg.WORK.cooldownMs / 60000)} menit.</i>`,
          ].join('\n'))
        }
        if (result.reason === 'cooldown') {
          return ctx.send(`⏳ Kamu baru saja kerja. Coba lagi dalam ${duration(result.remainingMs)}.`)
        }
        if (result.reason === 'duplicate') return ctx.send('ℹ️ Permintaan ini sudah diproses.')
        return ctx.send('❌ Kerja gagal diproses. Coba lagi nanti.')
      }

      /* Game: tebak angka (tombol, hadiah nyata) */
      if (sub === 'tebak' || sub === 'guess') {
        if (!rpg.profile(jid).hasProfile) return ctx.send('Buat profil dulu: <code>/rpg mulai</code>.')
        const answer = 1 + Math.floor(Math.random() * 4)
        const round = crypto.randomBytes(5).toString('hex')
        const buttons = [1, 2, 3, 4].map(value => ({
          text: String(value),
          callback_data: `cb:${createCallback({
            userId: ctx.userId, platform: 'telegram', platformUserId: ctx.platformUserId,
            action: 'rpg.guess', payload: { jid, answer, round, pick: value },
          })}`,
        }))
        return ctx.send([
          '🎲 <b>TEBAK ANGKA</b>', '',
          'Aku menyimpan satu angka 1–4. Tebak yang benar dan dapat <b>150 koin</b> + <b>60 EXP</b>.',
          '<i>Satu tebakan per ronde. Salah = tidak dapat apa-apa.</i>',
        ].join('\n'), { reply_markup: inline([buttons]) })
      }

      return ctx.send([
        '<b>🎮 RPG</b>', '',
        '/rpg mulai — buat profil',
        '/rpg — profil & level',
        '/rpg inv — inventori',
        '/rpg kerja — cari koin (cooldown 30 menit)',
        '/rpg harian — hadiah harian',
        '/rpg tebak — mini game tebak angka',
        '/rpg top [exp] — papan peringkat',
        '', identityNote,
      ].join('\n'))
    },
  })

  /* ─────────────── TO URL ─────────────── */
  define('tourl', {
    description: 'Ubah foto/video/dokumen jadi tautan',
    permission: 'media.upload',
    handler: async (ctx) => {
      await ctx.send([
        '🔗 <b>MEDIA → URL</b>',
        '',
        'Kirim foto, video (≤20 MB lewat Telegram), atau dokumen PDF/ZIP.',
        'Bot menyimpan di penyimpanan internal dan membalas tautan bertanda tangan.',
        '',
        `<b>Disimpan permanen</b> — tautan tidak kedaluwarsa dan berkas tidak dihapus otomatis.`,
        `Batas internal: gambar ${media.MAX_BYTES.image / 1048576} MB · video ${media.MAX_BYTES.video / 1048576} MB · dokumen ${media.MAX_BYTES.document / 1048576} MB.`,
        'Hapus kapan saja lewat tombol di balasan upload atau /files.',
        'Nama objek acak dan berkas tidak pernah dieksekusi.',
      ].join('\n'))
    },
  })

  /* ─────────────── FILES (media permanen) ─────────────── */
  define('files', {
    description: 'Daftar berkas media permanen milikmu',
    permission: 'media.upload',
    handler: async (ctx) => {
      const mine = media.listMedia({ userId: ctx.userId, limit: 10 })
      if (!mine.length) {
        return ctx.send([
          '🗂 <b>BERKAS SAYA</b>', '',
          '<i>Belum ada berkas.</i>',
          'Kirim foto/video/dokumen langsung ke bot, atau /tourl untuk panduan.',
        ].join('\n'))
      }
      const base = publicBase(ctx)
      const lines = ['🗂 <b>BERKAS SAYA</b>', `Total tampil: ${mine.length} · simpan permanen`, '']
      const rows = []
      for (const item of mine) {
        const url = media.mediaUrl(item.id, { baseUrl: base, userId: ctx.userId, permanent: true })
        lines.push(`• <a href="${escapeHtml(url)}">${escapeHtml(item.name || item.id)}</a> · ${bytes(item.bytes)}`)
        lines.push(`  <code>${item.id}</code> · ${item.mime} · ${item.permanent ? 'permanen' : `sampai ${new Date(item.expiresAt).toLocaleDateString('id-ID')}`}`)
        const token = createCallback({
          userId: ctx.userId, platform: 'telegram', platformUserId: ctx.platformUserId,
          action: 'media.delete', payload: { id: item.id },
        })
        rows.push([{ text: `🗑 Hapus ${String(item.name || item.id).slice(0, 24)}`, callback_data: `cb:${token}` }])
      }
      lines.push('', `${base}/api/platform-system/media/<id> — wajib memakai tautan bertanda tangan utuh.`)
      return ctx.send(lines.join('\n'), { disable_web_page_preview: true, reply_markup: inline(rows) })
    },
  })

  /* ─────────────── HEALTH ─────────────── */
  define('health', {
    description: 'Kesehatan integrasi (RPG, saham, Telegram, panel)',
    handler: async (ctx) => {
      const rows = globalThis.__umiPlatformAudit?.getHealth?.() || []
      const main = wa.mainBotState()
      const lines = ['🩺 <b>KESEHATAN INTEGRASI</b>', '']
      lines.push(`${main.connected ? '🟢' : '🟡'} <b>whatsapp</b> · ${main.connection} · ${duration(main.uptimeSeconds * 1000)}`)
      if (!rows.length) lines.push('<i>Belum ada pemeriksaan integrasi tercatat.</i>')
      for (const row of rows) {
        const icon = row.status === 'ok' ? '🟢' : row.status === 'error' ? '🔴' : '🟡'
        lines.push(`${icon} <b>${escapeHtml(row.name)}</b> · ${escapeHtml(row.detail || row.status)}`)
        lines.push(`└ ${new Date(row.checkedAt).toLocaleString('id-ID')}`)
      }
      lines.push('', '<i>Status di atas dibaca dari tabel integration_health di backend yang sama.</i>')
      return ctx.send(lines.join('\n'))
    },
  })

  /* ─────────────── ADMIN ─────────────── */
  define('fitur', {
    description: 'Katalog fitur bot: kategori + daftar perintah WhatsApp',
    handler: async (ctx, parsed) => {
      const cats = catalog.categories()
      if (!cats.length) {
        return ctx.send('⚠️ Katalog plugin WhatsApp belum dimuat di proses ini.\nCoba lagi setelah bot selesai start, atau cek log server.')
      }
      const tag = catalog.resolveCategory((parsed.args || [])[0])
      if (tag) return sendCategory(ctx, tag, Number(parsed.args?.[1]) || 1)
      const built = catalog.catalog()
      return ctx.send([
        '📦 <b>FITUR BOT</b>', '',
        `Perintah plugin WhatsApp aktif : <b>${built.total}</b>`,
        `Kategori                       : <b>${cats.length}</b>`,
        '',
        ...cats.map(entry => `${entry.icon} <b>${entry.label}</b> — ${entry.count} · <code>/menu ${entry.id}</code>`),
        '',
        'Cari: <code>/cari sticker</code> · Semua: <code>/allmenu</code>',
      ].join('\n'))
    },
  })

  define('errors', {
    description: 'Log error bot terakhir (owner/developer)',
    handler: async (ctx, parsed) => {
      if (!can(ctx.role, 'mainbot.manage') && !can(ctx.role, 'platform.audit.read')) {
        return ctx.send('⛔ Log error hanya untuk owner/developer.')
      }
      const arg = String(parsed.args[0] || '').toLowerCase()
      if (arg === 'uji' || arg === 'test') {
        const result = await recordError(new Error('Uji jalur notifikasi error dari /errors (Telegram)'), {
          source: 'manual-test', plugin: 'telegram/commands', command: 'errors',
          scope: `telegram:${ctx.botId || ''}`, chat: String(ctx.chatId || ''), force: true,
        })
        return ctx.send(result.notified > 0
          ? `✅ Uji terkirim ke ${result.notified} chat Telegram.`
          : '⚠️ Tercatat, tetapi tidak ada chat Telegram tujuan (cek TELEGRAM_BOT_TOKEN & TELEGRAM_OWNER_IDS).')
      }
      const limit = /^\d+$/.test(arg) ? Math.min(30, Number(arg)) : 8
      await ctx.send(escapeHtml(errorSummaryText(limit)))
    },
  })

  define('panel', {
    description: 'Panel hosting (owner/developer) & tautan panel web',
    sensitive: true,
    handler: async (ctx, parsed) => {
      const sub = String(parsed.args[0] || 'info').toLowerCase()
      const privileged = can(ctx.role, 'server.panel.manage')

      // Pengguna biasa tetap dapat tautan dashboard; kredensial tidak.
      if (!privileged && !['web', 'dashboard'].includes(sub)) {
        const url = globalThis.__umiPlatformWebUrl || 'https://jadibot-alzriss.gwenna.my.id'
        return ctx.send(`🖥 <b>PANEL WEB</b>\n\n${escapeHtml(url)}/platform\n\nPengaturan panel hosting hanya untuk owner/developer.`)
      }
      if (['set', 'hapus', 'clear', 'reset', 'test'].includes(sub) && !privileged) {
        return ctx.send('⛔ Pengaturan panel hanya untuk owner/developer.')
      }

      if (sub === 'info' || sub === 'status') {
        const info = panel.describePanel()
        const lines = [
          '🛠 <b>PANEL HOSTING</b>', '',
          `Status     : ${info.configured ? '✅ terkonfigurasi' : '⚠️ belum lengkap'}`,
          `URL        : ${info.url ? `<code>${escapeHtml(info.url)}</code>` : '<i>belum diatur</i>'}`,
          `Server ID  : ${info.serverId ? `<code>${escapeHtml(info.serverId)}</code>` : '<i>belum diatur</i>'}`,
          `API klien  : ${info.clientKeySet ? `<code>${escapeHtml(info.clientKeyMasked || '')}</code>` : '<i>belum diatur</i>'}`,
          `API app    : ${info.applicationKeySet ? '<i>tersimpan (disamarkan)</i>' : '<i>belum diatur</i>'}`,
          `Slot 1     : ${info.managed ? `dikelola bot${info.enabled ? ' · aktif' : ' · nonaktif'}` : '<i>bukan slot terkelola</i>'}`,
          '', '<b>Ubah</b> (owner/developer):',
          '<code>/panel set url https://panel.domain.tld</code>',
          '<code>/panel set ptlc PTLC_KEY</code>',
          '<code>/panel set ptla PTLA_KEY</code>',
          '<code>/panel set server d178bf71</code>',
          '<code>/panel test</code> · <code>/panel hapus</code> · <code>/panel web</code>',
          '', '<i>Pesan berisi kunci otomatis dihapus setelah diproses.</i>',
        ]
        if (info.clientKeySet && info.clientKeyReadable === false) {
          lines.push('', '⚠️ Kunci tersimpan tidak bisa dibuka — <code>PLATFORM_SECRET_KEY</code> server berubah. Set ulang kuncinya.')
        }
        return ctx.send(lines.join('\n'))
      }

      if (sub === 'web' || sub === 'dashboard') {
        const url = globalThis.__umiPlatformWebUrl || 'https://jadibot-alzriss.gwenna.my.id'
        return ctx.send(`🖥 <b>PANEL WEB</b>\n\n${escapeHtml(url)}/platform\n\nLogin memakai akun web kamu (sesi Supabase). Peran yang tampil di panel = peran database.`)
      }

      if (sub === 'test') {
        try {
          const result = await panel.testPanel()
          if (!result.ok) return ctx.send(`❌ Uji panel gagal: ${escapeHtml(result.error || 'tidak diketahui')}\nHTTP ${result.status || '-'} · ${result.latencyMs} ms`)
          return ctx.send([
            '✅ <b>PANEL TERHUBUNG</b>', '',
            `Akun     : <b>${escapeHtml(result.username || '-')}</b>`,
            `Email    : ${escapeHtml(result.email || '-')}`,
            `Admin    : ${result.admin ? 'ya' : 'tidak'}`,
            `Latensi  : ${result.latencyMs} ms`,
            `Endpoint : <code>/api/client/account</code>`,
          ].join('\n'))
        } catch (error) {
          return ctx.send(`❌ ${escapeHtml(error.message || 'Uji panel gagal.')}`)
        }
      }

      if (sub === 'hapus' || sub === 'clear' || sub === 'reset') {
        const info = panel.clearPanelConfig({ userId: ctx.userId, platform: 'telegram', platformUserId: ctx.platformUserId })
        audit({ actorUserId: ctx.userId, platform: 'telegram', platformUserId: ctx.platformUserId, action: 'panel.command.clear' })
        return ctx.send(`🗑 Konfigurasi panel dihapus. Slot 1 ${info.managed ? 'masih dikelola' : 'dibersihkan'}.`)
      }

      if (sub === 'set') {
        const field = String(parsed.args[1] || '').toLowerCase()
        const value = parsed.args.slice(2).join(' ').trim()
        if (!field || !value) {
          return ctx.send('Format: <code>/panel set url|ptlc|ptla|server &lt;nilai&gt;</code>')
        }
        // Pesan berisi kunci dihapus lebih dulu supaya tidak tertinggal di riwayat grup.
        // Bila bot bukan admin grup, Telegram menolak; pengguna diberi tahu.
        let keyVisible = false
        if (['ptlc', 'ptla'].includes(field)) keyVisible = (await ctx.deleteMessage?.()) === false
        try {
          const patch = field === 'url' ? { url: value }
            : field === 'ptlc' || field === 'client' ? { clientKey: value }
            : field === 'ptla' || field === 'app' ? { applicationKey: value }
            : field === 'server' || field === 'serverid' ? { serverId: value }
            : null
          if (!patch) return ctx.send('Field tidak dikenal. Pilihan: <code>url, ptlc, ptla, server</code>.')
          const info = panel.savePanelConfig(patch, { userId: ctx.userId, platform: 'telegram', platformUserId: ctx.platformUserId })
          audit({ actorUserId: ctx.userId, platform: 'telegram', platformUserId: ctx.platformUserId, action: 'panel.command.set', meta: { field } })
          return ctx.send([
            `✅ <b>${escapeHtml(field.toUpperCase())}</b> disimpan.`,
            '',
            `URL       : ${info.url ? `<code>${escapeHtml(info.url)}</code>` : '<i>belum</i>'}`,
            `Server ID : ${info.serverId ? `<code>${escapeHtml(info.serverId)}</code>` : '<i>belum</i>'}`,
            `API klien : ${info.clientKeySet ? `<code>${escapeHtml(info.clientKeyMasked || '')}</code>` : '<i>belum</i>'}`,
            `Slot 1    : ${info.configured ? '✅ siap dipakai' : '⚠️ belum lengkap'}`,
            '', info.configured ? 'Cek koneksi: <code>/panel test</code>' : 'Lengkapi url + ptlc + server, lalu <code>/panel test</code>.',
            keyVisible ? '\n⚠️ Pesan berisi kunci <b>tidak bisa dihapus</b> (bot belum admin grup). Hapus manual sekarang.' : '',
          ].filter(Boolean).join('\n'))
        } catch (error) {
          if (['ptlc', 'ptla'].includes(field)) await ctx.deleteMessage?.()
          return ctx.send(`❌ ${escapeHtml(error.message || 'Gagal menyimpan.')}`)
        }
      }

      return ctx.send('Panel: <code>/panel</code> · <code>/panel set …</code> · <code>/panel test</code> · <code>/panel hapus</code>')
    },
  })

  define('admin', {
    description: 'Panel pengelola (owner/developer)',
    permission: 'telegram.status',
    sensitive: true,
    handler: async (ctx, parsed) => {
      const sub = String(parsed.args[0] || 'ringkas').toLowerCase()
      if (sub === 'bot' || sub === 'bots') {
        if (!can(ctx.role, 'telegram.manage')) return ctx.send('⛔ Butuh izin telegram.manage.')
        const rows = globalThis.__umiTelegramBots?.listBots?.() || []
        const lines = ['🤖 <b>BOT TELEGRAM</b>', '']
        if (!rows.length) lines.push('<i>Belum ada konfigurasi tersimpan.</i>')
        for (const row of rows) {
          lines.push(`• <b>${escapeHtml(row.label)}</b> — @${escapeHtml(row.username || '-')} (${row.botId || '-'})`)
          lines.push(`  status: ${row.status} · ${row.enabled ? 'aktif' : 'nonaktif'} · mode ${row.mode}`)
        }
        lines.push('', 'Kelola (aktif/nonaktif/cabut) lewat panel web /panel → Telegram.')
        return ctx.send(lines.join('\n'))
      }

      if (sub === 'users') {
        if (!can(ctx.role, 'platform.users.read')) return ctx.send('⛔ Butuh izin platform.users.read.')
        const { items, total } = globalThis.__umiPlatformIdentity.listUsers({ limit: 10 })
        const lines = [`👥 <b>PENGGUNA</b> (${total})`, '']
        for (const user of items) lines.push(`• <code>${escapeHtml(user.id)}</code> · ${roleBadge(user.role)} · ${user.identities} identitas`)
        lines.push('', 'Ubah role lewat panel web agar tercatat penuh di audit.')
        return ctx.send(lines.join('\n'))
      }

      if (sub === 'audit') {
        if (!can(ctx.role, 'platform.audit.read')) return ctx.send('⛔ Butuh izin platform.audit.read.')
        const { items } = globalThis.__umiPlatformAudit.listAudit({ limit: 12 })
        const lines = ['🧾 <b>AUDIT TERBARU</b>', '']
        for (const item of items) lines.push(`${new Date(item.at).toLocaleString('id-ID')} · ${item.action} · ${item.result}`)
        if (!items.length) lines.push('<i>Belum ada event.</i>')
        return ctx.send(lines.join('\n'))
      }

      if (sub === 'chats') {
        if (!can(ctx.role, 'platform.audit.read')) return ctx.send('⛔ Butuh izin platform.audit.read.')
        const rows = chats.listChats({ limit: 20 })
        const lines = ['💬 <b>CHAT TERLIHAT</b>', '']
        if (!rows.length) lines.push('<i>Belum ada chat tercatat. Tambahkan bot ke grup, lalu kirim /start di sana.</i>')
        for (const chat of rows) {
          lines.push(`${chat.isGroup ? '👥' : '👤'} <b>${escapeHtml(chat.title || chat.username || chat.chatId)}</b>`)
          lines.push(`  <code>${chat.chatId}</code> · ${chat.type} · terakhir ${new Date(chat.lastSeenAt).toLocaleString('id-ID')}`)
        }
        lines.push('', 'Gunakan /admin chats untuk memastikan bot sudah mengenali grup arsip.')
        return ctx.send(lines.join('\n'))
      }

      if (sub === 'health') {
        const rows = globalThis.__umiPlatformAudit.getHealth()
        const lines = ['🩺 <b>HEALTH INTEGRASI</b>', '']
        if (!rows.length) lines.push('<i>Belum ada pemeriksaan.</i>')
        for (const row of rows) lines.push(`${row.status === 'ok' ? '🟢' : row.status === 'error' ? '🔴' : '🟡'} <b>${escapeHtml(row.name)}</b> · ${escapeHtml(row.detail || '')}`)
        return ctx.send(lines.join('\n'))
      }

      const lines = [
        '⚙️ <b>ADMIN</b>', '',
        '/admin bot — konfigurasi bot Telegram',
        '/admin users — daftar pengguna & role',
        '/admin audit — audit log terbaru',
        '/admin chats — grup/chat yang dikenal bot',
        '/admin health — status integrasi',
        '', 'Aksi tulis (ganti token, ubah role, slot server) dilakukan di panel web: /panel',
      ]
      return ctx.send(lines.join('\n'))
    },
  })

  /* ─────────────── RESELLER ─────────────── */
  define('reseller', {
    description: 'Ringkasan reseller',
    permission: 'reseller.read',
    handler: async (ctx) => {
      const data = globalThis.__umiPlatformReseller?.summary?.(ctx.userId) || { customers: 0, orders: 0, commission: 0, currency: 'IDR', available: false }
      const lines = [
        '🤝 <b>RESELLER</b>', '',
        `Pelanggan : ${data.available ? data.customers : '—'}`,
        `Pesanan   : ${data.available ? data.orders : '—'}`,
        `Komisi    : ${data.available ? `Rp ${rupiah(data.commission)}` : '—'}`,
        '',
      ]
      if (!data.available) lines.push('<i>Data reseller belum tersedia di backend ini. Panel wallet/reseller akan menampilkan angka nyata setelah tabel reseller diisi.</i>')
      lines.push('Kelola pelanggan lewat panel web: /panel')
      await ctx.send(lines.join('\n'))
    },
  })

  /* ─────────────── Callback actions ─────────────── */
  router.registerCallback('menu.nav', async (ctx, payload) => {
    // Semua perubahan tampilan menu memakai pesan yang sama.
    ctx = withEditInPlace(ctx)
    const view = String(payload?.view || '')
    // Halaman kategori plugin: `cat:<kategori>:<halaman>`.
    const cat = view.match(/^cat:([a-z0-9_-]+)(?::(\d+))?$/)
    if (cat) return sendCategory(ctx, cat[1], Number(cat[2]) || 1)

    // Keluarga fitur ringkas: `fn:<id>:<halaman>`.
    const fn = view.match(/^fn:([a-z0-9_-]+)(?::(\d+))?$/)
    if (fn) return sendFunction(ctx, fn[1], Number(fn[2]) || 1)

    // Kartu satu opsi: `opt:<perintah>`.
    const opt = view.match(/^opt:([a-z0-9_-]+)$/)
    if (opt) return sendOption(ctx, opt[1])

    // Aksi perintah dengan argumen: `cmd:rpg:kerja`, `cmd:saham:beli`.
    const cmd = view.match(/^cmd:([a-z0-9_-]+)(?::(.+))?$/)
    if (cmd) {
      const command = router.commands.get(cmd[1])
      if (!command) return ctx.send('Perintah tidak tersedia.')
      if (command.permission && !router.allowed(ctx, cmd[1])) return ctx.send('Menu ini tidak tersedia untuk peran kamu.')
      const args = (cmd[2] || '').split(':').filter(Boolean)
      return command.handler(ctx, { name: cmd[1], args, text: args.join(' ') }, null)
    }

    const map = {
      status: 'status', profile: 'profile', jadibot: 'jadibot', saham: 'saham', rpg: 'rpg',
      tourl: 'tourl', server: 'server', panel: 'panel', admin: 'admin', reseller: 'reseller',
      help: 'help', allmenu: 'allmenu', menu: 'menu', fitur: 'fitur',
    }
    const name = map[view]
    if (!name) return ctx.send('Menu tidak tersedia.')
    if (!router.allowed(ctx, name)) return ctx.send('Menu ini tidak tersedia untuk peran kamu.')
    const command = router.commands.get(name)
    return command.handler(ctx, { name, args: [], text: '' }, null)
  })

  router.registerCallback('server.action', async (ctx, payload) => {
    if (!can(ctx.role, 'server.control')) return ctx.send('⛔ Akses ditolak.')
    const result = await servers.serverAction(payload.slot, payload.action, { actor: ctx.actor, role: ctx.role })
    await ctx.send(`✅ <b>${escapeHtml(payload.action)}</b> dikirim ke server ${payload.slot} (<code>${escapeHtml(result.name || '-')}</code>).\nStatus panel: HTTP ${result.httpStatus}.`)
  })

  router.registerCallback('jadibot.stop', async (ctx, payload) => {
    const jid = whatsappJidFor(ctx.userId)
    const owned = wa.sessionsForUser(ctx.userId, jid).find(row => row.number === payload.number)
    if (!owned) return ctx.send('❌ Nomor itu bukan sesi milikmu.')
    await wa.stopSession(payload.number, { deleteSession: false, actor: ctx.actor })
    audit({ actorUserId: ctx.userId, platform: 'telegram', platformUserId: ctx.platformUserId, action: 'jadibot.stop', resource: payload.number })
    await ctx.send(`⏹ Sesi <code>${owned.masked}</code> dihentikan.`)
  })

  router.registerCallback('stock.trade', async (ctx, payload) => {
    if (!can(ctx.role, 'stock.trade')) return ctx.send('⛔ Akses ditolak.')
    const result = await stock.trade({
      number: payload.number, symbol: payload.symbol, side: payload.side, amount: payload.lots,
      idempotencyKey: `tg-trade:${ctx.platformUserId}:${payload.side}:${payload.symbol}:${payload.lots}:${Math.floor(Date.now() / 60000)}`,
    }, { db: globalThis.__umiPlatformDb?.() })
    audit({
      actorUserId: ctx.userId, platform: 'telegram', platformUserId: ctx.platformUserId,
      action: 'stock.trade', resource: `${payload.symbol}:${payload.side}`,
      meta: { lots: payload.lots, duplicate: Boolean(result.duplicate) },
    })
    await ctx.send(result.duplicate
      ? 'ℹ️ Order ini sudah diproses sebelumnya (idempotent), tidak dieksekusi dua kali.'
      : `✅ Order <b>${payload.side === 'buy' ? 'BELI' : 'JUAL'}</b> ${payload.lots} lot ${escapeHtml(payload.symbol)} dikirim.\n${result.message ? escapeHtml(result.message) : ''}`)
  })

  router.registerCallback('rpg.daily', async (ctx, payload) => {
    const result = await rpg.claimDaily(payload.jid, { idempotencyKey: `${ctx.platformUserId}:${Math.floor(Date.now() / 1000)}` })
    if (result.ok) {
      audit({ actorUserId: ctx.userId, platform: 'telegram', platformUserId: ctx.platformUserId, action: 'rpg.daily', resource: payload.jid, meta: { koin: result.koin, exp: result.exp } })
      await ctx.send(`🎁 Hadiah diterima: +${rupiah(result.koin)} koin, +${rupiah(result.exp)} EXP.\nTotal: ${rupiah(result.totalKoin)} koin · Level ${result.level}.`)
    } else if (result.reason === 'cooldown') {
      await ctx.send(`⏳ Hadiah harian sudah diklaim. Bisa lagi dalam ${duration(result.remainingMs)}.`)
    } else if (result.reason === 'duplicate') {
      await ctx.send('ℹ️ Hadiah ini sudah diproses sebelumnya.')
    } else {
      await ctx.send('❌ Hadiah gagal diproses.')
    }
  })

  router.registerCallback('rpg.guess', async (ctx, payload) => {
    if (!payload?.jid || !payload?.round) return ctx.send('❌ Ronde tidak valid. Kirim /rpg tebak lagi.')
    if (!rpg.profile(payload.jid).hasProfile) return ctx.send('Buat profil dulu: <code>/rpg mulai</code>.')
    const correct = Number(payload.pick) === Number(payload.answer)
    if (!correct) {
      audit({
        actorUserId: ctx.userId, platform: 'telegram', platformUserId: ctx.platformUserId,
        action: 'rpg.guess', resource: `round:${payload.round}`, meta: { correct: false, pick: payload.pick },
      })
      return ctx.send(`❌ Salah. Angkanya <b>${payload.answer}</b>. Coba lagi: <code>/rpg tebak</code>`)
    }
    const result = await rpg.reward(payload.jid, {
      koin: 150, exp: 60, key: `guess:${ctx.platformUserId}:${payload.round}`, reason: 'tebak-angka',
    })
    if (result.ok) {
      audit({
        actorUserId: ctx.userId, platform: 'telegram', platformUserId: ctx.platformUserId,
        action: 'rpg.guess', resource: `round:${payload.round}`, meta: { correct: true, koin: 150, exp: 60 },
      })
      return ctx.send([
        '🎉 <b>BENAR!</b>', '',
        'Hadiah: <b>+150 koin</b> · <b>+60 EXP</b>',
        `Total koin: <b>${rupiah(result.koin)}</b>`,
        '', 'Main lagi: <code>/rpg tebak</code>',
      ].join('\n'))
    }
    if (result.reason === 'duplicate') return ctx.send('ℹ️ Hadiah ronde ini sudah diberikan.')
    return ctx.send('❌ Hadiah gagal diproses.')
  })

  router.registerCallback('media.delete', async (ctx, payload) => {
    if (!payload?.id) return ctx.send('❌ ID berkas tidak ada di tombol ini.')
    const result = media.deleteMedia(payload.id, {
      userId: ctx.userId, role: ctx.role,
      actor: { platform: 'telegram', platformUserId: ctx.platformUserId },
    })
    audit({
      actorUserId: ctx.userId, platform: 'telegram', platformUserId: ctx.platformUserId,
      action: 'media.delete', resource: `media:${result.deleted}`, meta: { via: 'telegram-button' },
    })
    return ctx.send(`🗑 Berkas <code>${escapeHtml(result.deleted)}</code> dihapus permanen. Tautan lama tidak berlaku lagi.`)
  })

  return router
}

export async function handleMediaMessage(ctx, message, { baseUrl = '' } = {}) {
  const kind = message.photo ? 'photo' : message.video ? 'video' : message.document ? 'document' : message.audio ? 'audio' : null
  if (!kind) return ctx.send('Kirim foto, video, atau dokumen.')
  const fileId = kind === 'photo'
    ? message.photo[message.photo.length - 1].file_id
    : message[kind].file_id
  const name = message[kind].file_name || (kind === 'photo' ? 'foto.jpg' : null)
  await ctx.sendChatAction('upload_document')
  const { buffer } = await ctx.downloadFile(fileId)
  // To-URL menyimpan PERMANEN: berkas tidak dihapus prune harian dan tautannya
  // memakai tanda tangan tanpa masa berlaku (e=0). Penghapusan hanya manual.
  const stored = media.storeMedia(buffer, {
    userId: ctx.userId, platform: 'telegram', name, permanent: true,
    actor: { platformUserId: ctx.platformUserId },
  })
  const url = media.mediaUrl(stored.id, { baseUrl: baseUrl || publicBase(ctx), userId: ctx.userId, permanent: true })
  const removeToken = createCallback({
    userId: ctx.userId, platform: 'telegram', platformUserId: ctx.platformUserId,
    action: 'media.delete', payload: { id: stored.id },
  })
  return ctx.send([
    '✅ <b>Upload berhasil · disimpan permanen</b>', '',
    `Tipe : <code>${stored.mime}</code>`,
    `Ukuran: ${bytes(stored.bytes)}`,
    `ID   : <code>${stored.id}</code>`,
    `SHA256: <code>${stored.sha256.slice(0, 24)}…</code>`,
    'Masa simpan: <b>permanen</b> (tidak kedaluwarsa)',
    '',
    `<a href="${escapeHtml(url)}">Buka media</a>`,
    `<code>${escapeHtml(url)}</code>`,
  ].join('\n'), {
    disable_web_page_preview: true,
    reply_markup: inline([[{ text: '🗑 Hapus berkas', callback_data: `cb:${removeToken}` }]]),
  })
}

function publicBase(ctx) {
  return globalThis.__umiPlatformPublicBase || ctx.publicBaseUrl || ''
}
