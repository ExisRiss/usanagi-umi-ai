/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "pantun2", "category": "random", "aliasMap": {"umi-random-pantun2": "pantun2", "umi-pantun2": "pantun2", "pantun2": "pantun2"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/random/pantun2.js", metadata, m, extra)
handler.help = ["umi-random-pantun2"]
handler.command = ["umi-random-pantun2", "umi-pantun2", "pantun2"]
handler.tags = ["random"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "pantun2", "alias": [], "category": "random", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-random-pantun2": "pantun2", "umi-pantun2": "pantun2", "pantun2": "pantun2"}
export default handler
