/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "mulai", "category": "rpg", "aliasMap": {"umi-rpg-mulai": "mulai", "umi-mulai": "mulai", "mulai": "mulai"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/mulai.js", metadata, m, extra)
handler.help = ["umi-rpg-mulai"]
handler.command = ["umi-rpg-mulai", "umi-mulai", "mulai"]
handler.tags = ["rpg"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "mulai", "alias": [], "category": "rpg", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-rpg-mulai": "mulai", "umi-mulai": "mulai", "mulai": "mulai"}
export default handler
