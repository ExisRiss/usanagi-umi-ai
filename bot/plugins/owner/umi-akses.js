/* By AlzRiss - Usanagi Umi AI
 *
 * Task135 — Pusat role/akses user (BOT UTAMA & JADIBOT).
 *
 * Role disimpan di database bot: global.db.data.users[jid].akses
 *   owner  → boleh semua perintah admin grup milik bot ini
 *   admin  → boleh perintah admin grup (settime/tutupgc/…) walau bukan admin WA
 *   member → (bawaan) hanya hak normal
 *
 * Perintah (khusus owner bot):
 *   .setakses @user owner|admin|member   (alias .setrol)
 *   .delakses @user
 *   .akseslist
 * .myakses dan .aksesinfo bisa dipakai semua orang.
 *
 * Plugin lain bisa memakai helper global:
 *   global.umiAkses.role(jid)          → 'owner' | 'admin' | 'member'
 *   global.umiAkses.minimal(jid, 'admin') → true/false
 */

const ROLE_SAH = ['owner', 'admin', 'member']

function db() {
  try {
    if (!global.db.data.users) global.db.data.users = {}
    return global.db.data
  } catch (error) {
    return null
  }
}

function normalJid(jid) {
  const teks = String(jid || '')
  if (!teks) return ''
  const nomor = teks.split('@')[0].split(':')[0]
  return /^\d+$/.test(nomor) ? `${nomor}@s.whatsapp.net` : teks
}

function roleUser(jid) {
  const data = db()
  if (!data) return 'member'
  const kunci = normalJid(jid)
  const user = data.users[kunci] || data.users[String(jid)] || data.users[String(jid).split('@')[0]]
  const role = String((user && user.akses) || 'member').toLowerCase()
  return ROLE_SAH.includes(role) ? role : 'member'
}

function minimal(jid, batas) {
  const tingkat = { member: 0, admin: 1, owner: 2 }
  const role = roleUser(jid)
  return (tingkat[role] || 0) >= (tingkat[batas] || 0)
}

global.umiAkses = global.umiAkses || {}
global.umiAkses.role = roleUser
global.umiAkses.minimal = minimal

function targetJid(m, teks) {
  const disebut = m.mentionedJid && m.mentionedJid[0]
  if (disebut) return normalJid(disebut)
  const dikutip = m.quoted && (m.quoted.sender || m.quoted.participant)
  if (dikutip && !teks) return normalJid(dikutip)
  const angka = String(teks || '').replace(/[^0-9]/g, '')
  if (angka.length >= 8) return `${angka}@s.whatsapp.net`
  return ''
}

let handler = async (m, extra = {}) => {
  const { args = [], command = '', isOwner, isROwner } = extra
  const data = db()
  if (!data) return m.reply('❌ Database bot belum siap, coba lagi sebentar.')
  const sayaOwner = Boolean(isOwner || isROwner || m.fromMe)

  if (command === 'akses' || command === 'paneladmin') {
    return m.reply(
`🛡️ *ROLE / AKSES USER*

Role bot: owner, admin, member.

.setakses @user owner
.setakses @user admin
.setakses @user member
.delakses @user
.akseslist
.myakses
.aksesinfo @user

Yang dapat role *admin* boleh memakai perintah admin grup
(.settime, .setzona, .tutupgc, .bukagc) meski bukan admin WhatsApp.`
    )
  }

  if (command === 'myakses') {
    const role = roleUser(m.sender)
    return m.reply(`🛡️ Role kamu: *${role}*`)
  }

  if (command === 'setakses' || command === 'setroleakses') {
    if (!sayaOwner) return m.reply('❌ Khusus owner bot.')
    let jid = targetJid(m, args[0])
    let role = String(args[1] || '').toLowerCase()

    // Bentuk pendek: reply/tag user lalu ".setakses admin"
    if (!ROLE_SAH.includes(role)) {
      const mungkin = String(args[0] || '').toLowerCase()
      const kandidat = (m.quoted && (m.quoted.sender || m.quoted.participant)) || (m.mentionedJid && m.mentionedJid[0])
      if (ROLE_SAH.includes(mungkin) && kandidat) {
        jid = normalJid(kandidat)
        role = mungkin
      }
    }

    if (!jid) return m.reply('❌ Tag/reply user, atau tulis nomornya.\nContoh: .setakses @user admin')
    if (!ROLE_SAH.includes(role)) return m.reply(`❌ Role harus salah satu: ${ROLE_SAH.join(' / ')}`)
    const kunci = jid
    if (!data.users[kunci]) data.users[kunci] = {}
    data.users[kunci].akses = role
    if (typeof data.write === 'function') { try { await data.write() } catch (error) { } }
    return m.reply(`✅ Role *${kunci.split('@')[0]}* sekarang *${role}*.`)
  }

  if (command === 'delakses') {
    if (!sayaOwner) return m.reply('❌ Khusus owner bot.')
    const jid = targetJid(m, args[0])
    if (!jid) return m.reply('❌ Tag/reply user, atau tulis nomornya.')
    if (data.users[jid] && data.users[jid].akses) {
      delete data.users[jid].akses
      if (typeof data.write === 'function') { try { await data.write() } catch (error) { } }
      return m.reply(`✅ Role admin untuk *${jid.split('@')[0]}* dihapus (kembali member).`)
    }
    return m.reply('ℹ️ User itu tidak punya role khusus.')
  }

  if (command === 'aksesinfo') {
    const jid = targetJid(m, args[0]) || normalJid(m.sender)
    return m.reply(
`🛡️ *INFO AKSES*

Nomor: ${jid.split('@')[0]}
Role : ${roleUser(jid)}
Premium: ${data.users[jid] && data.users[jid].premiumTime > Date.now() ? 'ya' : 'tidak'}`
    )
  }

  if (command === 'akseslist' || command === 'rolelist') {
    const daftar = Object.keys(data.users)
      .filter((jid) => ROLE_SAH.includes(String(data.users[jid].akses || '').toLowerCase()) && data.users[jid].akses !== 'member')
      .map((jid) => `• ${jid.split('@')[0]} — ${data.users[jid].akses}`)
    if (!daftar.length) return m.reply('ℹ️ Belum ada user dengan role khusus.')
    return m.reply(`🛡️ *DAFTAR ROLE* (${daftar.length})\n\n${daftar.slice(0, 60).join('\n')}`)
  }
}

handler.help = ['setakses @user admin', 'delakses @user', 'akseslist', 'myakses', 'aksesinfo @user', 'paneladmin']
handler.tags = ['owner']
handler.command = /^(setakses|setroleakses|delakses|akseslist|rolelist|myakses|aksesinfo|akses|paneladmin)$/i
handler.owner = false
handler.ownerOnly = false
handler.group = false
handler.private = false

export { handler, roleUser, minimal }
export default handler
