import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "anichin", "category": "anime", "aliasMap": {"umi-anime-anichin": "anichin", "umi-anichin": "anichin", "anichin": "anichin"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/anime/anichin.js", metadata, m, extra)
handler.help = ["umi-anime-anichin"]
handler.command = ["umi-anime-anichin", "umi-anichin", "anichin"]
handler.tags = ["anime"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "anichin", "alias": [], "category": "anime", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-anime-anichin": "anichin", "umi-anichin": "anichin", "anichin": "anichin"}
export default handler
