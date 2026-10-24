/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "creatett", "category": "rpg", "aliasMap": {"umi-rpg-creatett": "creatett", "umi-creatett": "creatett", "creatett": "creatett"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/creatett.js", metadata, m, extra)
handler.help = ["umi-rpg-creatett"]
handler.command = ["umi-rpg-creatett", "umi-creatett", "creatett"]
handler.tags = ["rpg"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "creatett", "alias": [], "category": "rpg", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-rpg-creatett": "creatett", "umi-creatett": "creatett", "creatett": "creatett"}
export default handler
