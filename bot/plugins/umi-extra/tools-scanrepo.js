/*
╔══════════════════════════════════════════════╗
║        ⚡  𝑨𝑳𝒁𝑹𝑰𝑺𝑺 𝑴𝑫  ⚡                     ║
╚══════════════════════════════════════════════╝

╭───────────「 ✦ 𝑰𝑵𝑭𝑶 𝑨𝑳𝒁𝑹𝑰𝑺𝑺 ✦ 」───────────╮
│ 👤 Developer : 𝑨𝒍𝒛𝑹𝒊𝒔𝒔
│ 📢 Saluran   : https://whatsapp.com/channel/0029VbDBOXH11ulIKHVbmO0m
│ ⚙️ Engine    : Baileys Multi-Device
╰──────────────────────────────────────────────╯

              「 ⚡ 𝑨𝑳𝒁𝑹𝑰𝑺𝑺 𝑴𝑫 ⚡ 」
*/

import axios from "axios"

const pluginConfig = {
  name: "scanrepo",
  alias: ["scanrepodev"],
  category: "tools",
  description: "Scan repository GitHub untuk security risk",
  usage: ".scanrepo <github-url>",
  example: ".scanrepo https://github.com/owner/repo",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 30,
  energi: 2,
  isEnabled: true,
}

const API_URL = "https://www.scanrepo.dev/api/scan"

function riskEmoji(level) {
  switch (String(level || "").toLowerCase()) {
    case "critical": return "🔴"
    case "high": return "🟠"
    case "medium": return "🟡"
    case "low": return "🟢"
    default: return "⚪"
  }
}

async function handler(m) {
  let url = m.text?.trim()
  if (!url) return m.reply(`🔍 *SCANREPO*\n\nScan repository GitHub untuk security risk.\n\nContoh:\n\`${m.prefix}scanrepo https://github.com/owner/repo\``)
  if (!/^https?:\/\/github\.com\/[^\/]+\/[^\/]+/i.test(url)) {
    if (!url.startsWith("http")) url = `https://${url}`
    if (!/^https?:\/\/github\.com\/[^\/]+\/[^\/]+/i.test(url)) return m.reply("❌ URL GitHub tidak valid.")
  }
  await m.react("🔍")
  try {
    const res = await axios.post(API_URL, { url }, {
      timeout: 120000,
      headers: { "Content-Type": "application/json", Accept: "text/plain", "User-Agent": "Mozilla/5.0" },
      responseType: "text"
    })
    const raw = String(res.data || "")
    let result = null
    for (const line of raw.split(/\r?\n/)) {
      if (!line.trim()) continue
      try {
        const item = JSON.parse(line)
        if (item.type === "result") result = item.data
        if (item.type === "error") throw new Error(item.error || "scan error")
      } catch (e) {
        if (e?.message === "scan error" || /^HTTP|^scan error/.test(e?.message || "")) throw e
      }
    }
    if (!result) {
      try { result = JSON.parse(raw)?.data || JSON.parse(raw) } catch {}
    }
    if (!result) throw new Error("Tidak ada hasil scan")
    const meta = result.meta || {}
    const findings = (result.categories || []).flatMap(c => (c.findings || []).map(f => ({ ...f, category: c.name })))
    let txt = `╔═ 『 🔍 SCANREPO 』\n║ 📦 *${meta.owner && meta.repo ? `${meta.owner}/${meta.repo}` : url}*\n╠══════════════════════════\n║ ${riskEmoji(result.riskLevel)} *Risk Score:* *${Number(result.riskScore || 0).toFixed(0)} / 100*\n║ ├ Level: *${String(result.riskLevel || "UNKNOWN").toUpperCase()}*\n║ └ Files: *${result.filesScanned ?? 0} / ${result.totalRepoFiles ?? 0}*\n╠══════════════════════════`
    if (findings.length) {
      txt += `\n║ ⚠️ *Findings* (${findings.length})`
      for (const f of findings.slice(0, 8)) {
        txt += `\n║ ├ *${f.title || "Finding"}*\n║ │ ├ ${f.file || "?"}${f.line ? `:${f.line}` : ""}\n║ │ └ +${f.points || 0}pts`
      }
    }
    txt += `\n╚══════════════════════════`
    await m.reply(txt)
    await m.react("✅")
  } catch (e) {
    await m.react("❌")
    return m.reply(`❌ ScanRepo gagal: ${e.message}`)
  }
}

/* Compatibility adapter — By AlzRiss - Usanagi Umi AI */
const __umiCommands = ["scanrepo", "scanrepodev"]
const __umiOriginalHandler = handler
const __umiHandler = async function (m, context = {}) {
  const adapted = Object.create(m)
  Object.defineProperties(adapted, {
    text: { value: String(context.text || ''), writable: true, configurable: true },
    args: { value: context.args || [], writable: true, configurable: true },
    command: { value: String(context.command || '').toLowerCase(), writable: true, configurable: true },
    prefix: { value: context.usedPrefix || '.', writable: true, configurable: true },
    isOwner: { value: Boolean(context.isOwner), writable: true, configurable: true },
    isPremium: { value: Boolean(context.isPrems), writable: true, configurable: true },
    isAdmin: { value: Boolean(context.isAdmin), writable: true, configurable: true },
    isBotAdmin: { value: Boolean(context.isBotAdmin), writable: true, configurable: true }
  })
  return __umiOriginalHandler.call(this, adapted, {
    ...context,
    sock: context.conn,
    conn: context.conn,
    text: String(context.text || ''),
    query: String(context.text || ''),
    args: context.args || [],
    command: String(context.command || '').toLowerCase(),
    prefix: context.usedPrefix || '.',
    usedPrefix: context.usedPrefix || '.',
    db: global.db
  })
}
__umiHandler.help = ["scanrepo .scanrepo <github-url>"]
__umiHandler.tags = ["tools"]
__umiHandler.command = new RegExp(`^(${__umiCommands.map(value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})$`, 'i')
__umiHandler.owner = false
__umiHandler.premium = false
__umiHandler.group = false
__umiHandler.private = false
__umiHandler.admin = false
__umiHandler.botAdmin = false
__umiHandler.limit = false
__umiHandler.source = 'Usanagi Umi AI feature collection'
export default __umiHandler
