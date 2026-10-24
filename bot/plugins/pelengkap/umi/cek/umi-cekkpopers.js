/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cekkpopers", "category": "cek", "aliasMap": {"umi-cek-cekkpopers": "cekkpopers", "umi-cekkpopers": "cekkpopers", "umi-kpopers": "kpopers", "umi-kpop": "kpop", "kpop": "kpop"}, "description": "Cek tingkat kpopers kamu", "usage": ".cekkpopers <nama>", "example": ".cekkpopers Budi", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/cek/cekkpopers.js", metadata, m, extra)
handler.help = ["umi-cek-cekkpopers <nama>"]
handler.command = ["umi-cek-cekkpopers", "umi-cekkpopers", "umi-kpopers", "umi-kpop", "kpop"]
handler.tags = ["cek"]
handler.description = "Cek tingkat kpopers kamu"
handler.importSource = "umi"
handler.importConfig = {"name": "cekkpopers", "alias": ["kpopers", "kpop"], "category": "cek", "description": "Cek tingkat kpopers kamu", "usage": ".cekkpopers <nama>", "example": ".cekkpopers Budi", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-cek-cekkpopers": "cekkpopers", "umi-cekkpopers": "cekkpopers", "umi-kpopers": "kpopers", "umi-kpop": "kpop", "kpop": "kpop"}
export default handler
