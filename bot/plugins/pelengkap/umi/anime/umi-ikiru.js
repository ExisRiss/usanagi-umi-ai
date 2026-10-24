/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "ikiru", "category": "anime", "aliasMap": {"umi-anime-ikiru": "ikiru", "umi-ikiru": "ikiru", "ikiru": "ikiru"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/anime/ikiru.js", metadata, m, extra)
handler.help = ["umi-anime-ikiru"]
handler.command = ["umi-anime-ikiru", "umi-ikiru", "ikiru"]
handler.tags = ["anime"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "ikiru", "alias": [], "category": "anime", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-anime-ikiru": "ikiru", "umi-ikiru": "ikiru", "ikiru": "ikiru"}
export default handler
