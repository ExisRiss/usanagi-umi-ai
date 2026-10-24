/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "ceksn", "category": "economy", "aliasMap": {"umi-economy-ceksn": "ceksn", "umi-ceksn": "ceksn"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/economy/ceksn.js", metadata, m, extra)
handler.help = ["umi-economy-ceksn"]
handler.command = ["umi-economy-ceksn", "umi-ceksn"]
handler.tags = ["economy"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "ceksn", "alias": [], "category": "economy", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-economy-ceksn": "ceksn", "umi-ceksn": "ceksn"}
export default handler
