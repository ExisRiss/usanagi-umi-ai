/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "toproblox", "category": "general", "aliasMap": {"umi-general-toproblox": "toproblox", "umi-toproblox": "toproblox", "toproblox": "toproblox"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/general/roblox.js", metadata, m, extra)
handler.help = ["umi-general-toproblox"]
handler.command = ["umi-general-toproblox", "umi-toproblox", "toproblox"]
handler.tags = ["general"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "toproblox", "alias": [], "category": "general", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-general-toproblox": "toproblox", "umi-toproblox": "toproblox", "toproblox": "toproblox"}
export default handler
