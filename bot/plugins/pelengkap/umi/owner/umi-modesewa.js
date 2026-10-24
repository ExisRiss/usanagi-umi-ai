/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "modesewa", "category": "owner", "aliasMap": {"umi-owner-modesewa": "modesewa", "umi-modesewa": "modesewa", "umi-ms": "ms", "umi-sewamode": "sewamode", "modesewa": "modesewa", "ms": "ms", "sewamode": "sewamode"}, "description": "Mode sewa bot - aktifkan/nonaktifkan sistem sewa", "usage": ".modesewa <on/off/check>", "example": ".modesewa on", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/modesewa.js", metadata, m, extra)
handler.help = ["umi-owner-modesewa <on/off/check>"]
handler.command = ["umi-owner-modesewa", "umi-modesewa", "umi-ms", "umi-sewamode", "modesewa", "ms", "sewamode"]
handler.tags = ["owner"]
handler.description = "Mode sewa bot - aktifkan/nonaktifkan sistem sewa"
handler.importSource = "umi"
handler.importConfig = {"name": "modesewa", "alias": ["ms", "sewamode", "modesewa"], "category": "owner", "description": "Mode sewa bot - aktifkan/nonaktifkan sistem sewa", "usage": ".modesewa <on/off/check>", "example": ".modesewa on", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-modesewa": "modesewa", "umi-modesewa": "modesewa", "umi-ms": "ms", "umi-sewamode": "sewamode", "modesewa": "modesewa", "ms": "ms", "sewamode": "sewamode"}
export default handler
