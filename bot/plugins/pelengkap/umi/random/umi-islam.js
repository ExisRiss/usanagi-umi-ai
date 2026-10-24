/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "q-islam", "category": "random", "aliasMap": {"umi-random-q-islam": "q-islam", "umi-q-islam": "q-islam", "q-islam": "q-islam"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/random/islam.js", metadata, m, extra)
handler.help = ["umi-random-q-islam"]
handler.command = ["umi-random-q-islam", "umi-q-islam", "q-islam"]
handler.tags = ["random"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "q-islam", "alias": [], "category": "random", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-random-q-islam": "q-islam", "umi-q-islam": "q-islam", "q-islam": "q-islam"}
export default handler
