/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "ceksabar", "category": "cek", "aliasMap": {"umi-cek-ceksabar": "ceksabar", "umi-ceksabar": "ceksabar", "umi-sabar": "sabar", "umi-patience": "patience", "patience": "patience"}, "description": "Cek tingkat kesabaran kamu", "usage": ".ceksabar <nama>", "example": ".ceksabar Budi", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/cek/ceksabar.js", metadata, m, extra)
handler.help = ["umi-cek-ceksabar <nama>"]
handler.command = ["umi-cek-ceksabar", "umi-ceksabar", "umi-sabar", "umi-patience", "patience"]
handler.tags = ["cek"]
handler.description = "Cek tingkat kesabaran kamu"
handler.importSource = "umi"
handler.importConfig = {"name": "ceksabar", "alias": ["sabar", "patience"], "category": "cek", "description": "Cek tingkat kesabaran kamu", "usage": ".ceksabar <nama>", "example": ".ceksabar Budi", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-cek-ceksabar": "ceksabar", "umi-ceksabar": "ceksabar", "umi-sabar": "sabar", "umi-patience": "patience", "patience": "patience"}
export default handler
