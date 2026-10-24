/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cecanjapan", "category": "random", "aliasMap": {"umi-random-cecanjapan": "cecanjapan", "umi-cecanjapan": "cecanjapan", "cecanjapan": "cecanjapan"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/random/cecanjapan.js", metadata, m, extra)
handler.help = ["umi-random-cecanjapan"]
handler.command = ["umi-random-cecanjapan", "umi-cecanjapan", "cecanjapan"]
handler.tags = ["random"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "cecanjapan", "alias": [], "category": "random", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-random-cecanjapan": "cecanjapan", "umi-cecanjapan": "cecanjapan", "cecanjapan": "cecanjapan"}
export default handler
