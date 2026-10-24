import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "stor", "category": "anime", "aliasMap": {"umi-anime-stor": "stor", "umi-stor": "stor", "umi-ya": "ya", "umi-nime": "nime", "umi-nimestor": "nimestor", "ya": "ya"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/anime/story-anime.js", metadata, m, extra)
handler.help = ["umi-anime-stor"]
handler.command = ["umi-anime-stor", "umi-stor", "umi-ya", "umi-nime", "umi-nimestor", "ya"]
handler.tags = ["anime"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "stor", "alias": ["ya", "nime", "nimestor"], "category": "anime", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-anime-stor": "stor", "umi-stor": "stor", "umi-ya": "ya", "umi-nime": "nime", "umi-nimestor": "nimestor", "ya": "ya"}
export default handler
