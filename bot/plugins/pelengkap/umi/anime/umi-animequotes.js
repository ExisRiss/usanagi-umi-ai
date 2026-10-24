/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "animequotes", "category": "anime", "aliasMap": {"umi-anime-animequotes": "animequotes", "umi-animequotes": "animequotes"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/anime/animequotes.js", metadata, m, extra)
handler.help = ["umi-anime-animequotes"]
handler.command = ["umi-anime-animequotes", "umi-animequotes"]
handler.tags = ["anime"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "animequotes", "alias": [], "category": "anime", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-anime-animequotes": "animequotes", "umi-animequotes": "animequotes"}
export default handler
