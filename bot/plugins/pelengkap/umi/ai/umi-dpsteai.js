import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "dpsteai", "category": "ai", "aliasMap": {"umi-ai-dpsteai": "dpsteai", "umi-dpsteai": "dpsteai", "umi-dpste": "dpste", "umi-dipasteai": "dipasteai", "dpsteai": "dpsteai", "dpste": "dpste", "dipasteai": "dipasteai"}, "description": "Chat dengan AI dari dipastebin.web.id (mendukung session per-user)", "usage": ".dpsteai <pertanyaan> atau .dpsteai reset (untuk hapus sesi)", "example": ".dpsteai halo", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/ai/dpsteai.js", metadata, m, extra)
handler.help = ["umi-ai-dpsteai <pertanyaan> atau .dpsteai reset (untuk hapus sesi)"]
handler.command = ["umi-ai-dpsteai", "umi-dpsteai", "umi-dpste", "umi-dipasteai", "dpsteai", "dpste", "dipasteai"]
handler.tags = ["ai"]
handler.description = "Chat dengan AI dari dipastebin.web.id (mendukung session per-user)"
handler.importSource = "umi"
handler.importConfig = {"name": "dpsteai", "alias": ["dpste", "dipasteai"], "category": "ai", "description": "Chat dengan AI dari dipastebin.web.id (mendukung session per-user)", "usage": ".dpsteai <pertanyaan> atau .dpsteai reset (untuk hapus sesi)", "example": ".dpsteai halo", "isOwner": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-ai-dpsteai": "dpsteai", "umi-dpsteai": "dpsteai", "umi-dpste": "dpste", "umi-dipasteai": "dipasteai", "dpsteai": "dpsteai", "dpste": "dpste", "dipasteai": "dipasteai"}
export default handler
