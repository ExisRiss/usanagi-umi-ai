import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "anilist", "category": "anime", "aliasMap": {"umi-anime-anilist": "anilist", "umi-anilist": "anilist", "anilist": "anilist"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/anime/anilist.js", metadata, m, extra)
handler.help = ["umi-anime-anilist"]
handler.command = ["umi-anime-anilist", "umi-anilist", "anilist"]
handler.tags = ["anime"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "anilist", "alias": [], "category": "anime", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-anime-anilist": "anilist", "umi-anilist": "anilist", "anilist": "anilist"}
export default handler
