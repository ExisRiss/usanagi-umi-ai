import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "mobinime", "category": "anime", "aliasMap": {"umi-anime-mobinime": "mobinime", "umi-mobinime": "mobinime", "mobinime": "mobinime"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/anime/mobinime.js", metadata, m, extra)
handler.help = ["umi-anime-mobinime"]
handler.command = ["umi-anime-mobinime", "umi-mobinime", "mobinime"]
handler.tags = ["anime"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "mobinime", "alias": [], "category": "anime", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-anime-mobinime": "mobinime", "umi-mobinime": "mobinime", "mobinime": "mobinime"}
export default handler
