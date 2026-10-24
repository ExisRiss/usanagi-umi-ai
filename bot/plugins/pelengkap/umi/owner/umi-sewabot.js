/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "sewabot", "category": "owner", "aliasMap": {"umi-owner-sewabot": "sewabot", "umi-sewabot": "sewabot", "umi-sewa": "sewa", "sewabot": "sewabot", "sewa": "sewa"}, "description": "Toggle dan kelola sistem sewa bot", "usage": ".sewabot <on/off/leave/status>", "example": ".sewabot on", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/sewabot.js", metadata, m, extra)
handler.help = ["umi-owner-sewabot <on/off/leave/status>"]
handler.command = ["umi-owner-sewabot", "umi-sewabot", "umi-sewa", "sewabot", "sewa"]
handler.tags = ["owner"]
handler.description = "Toggle dan kelola sistem sewa bot"
handler.importSource = "umi"
handler.importConfig = {"name": "sewabot", "alias": ["sewa"], "category": "owner", "description": "Toggle dan kelola sistem sewa bot", "usage": ".sewabot <on/off/leave/status>", "example": ".sewabot on", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-sewabot": "sewabot", "umi-sewabot": "sewabot", "umi-sewa": "sewa", "sewabot": "sewabot", "sewa": "sewa"}
export default handler
