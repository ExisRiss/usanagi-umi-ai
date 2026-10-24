import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "komikindo", "category": "anime", "aliasMap": {"umi-anime-komikindo": "komikindo", "umi-komikindo": "komikindo"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/anime/komikindo.js", metadata, m, extra)
handler.help = ["umi-anime-komikindo"]
handler.command = ["umi-anime-komikindo", "umi-komikindo"]
handler.tags = ["anime"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "komikindo", "alias": [], "category": "anime", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-anime-komikindo": "komikindo", "umi-komikindo": "komikindo"}
export default handler
