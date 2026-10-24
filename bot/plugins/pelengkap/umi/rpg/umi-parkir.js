/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "parkir", "category": "rpg", "aliasMap": {"umi-rpg-parkir": "parkir", "umi-parkir": "parkir", "umi-kangparkir": "kangparkir", "umi-markir": "markir"}, "description": "Jadi tukang parkir minimarket, waspada satpol PP!", "usage": ".parkir", "example": ".parkir", "cooldown": 120, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/parkir.js", metadata, m, extra)
handler.help = ["umi-rpg-parkir"]
handler.command = ["umi-rpg-parkir", "umi-parkir", "umi-kangparkir", "umi-markir"]
handler.tags = ["rpg"]
handler.description = "Jadi tukang parkir minimarket, waspada satpol PP!"
handler.importSource = "umi"
handler.importConfig = {"name": "parkir", "alias": ["kangparkir", "markir"], "category": "rpg", "description": "Jadi tukang parkir minimarket, waspada satpol PP!", "usage": ".parkir", "example": ".parkir", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 120, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-rpg-parkir": "parkir", "umi-parkir": "parkir", "umi-kangparkir": "kangparkir", "umi-markir": "markir"}
export default handler
