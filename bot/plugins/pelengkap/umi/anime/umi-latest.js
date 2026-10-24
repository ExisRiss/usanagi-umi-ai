/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "animelatest", "category": "anime", "aliasMap": {"umi-anime-animelatest": "animelatest", "umi-animelatest": "animelatest", "umi-latestanime": "latestanime", "animelatest": "animelatest", "latestanime": "latestanime"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/anime/latest.js", metadata, m, extra)
handler.help = ["umi-anime-animelatest"]
handler.command = ["umi-anime-animelatest", "umi-animelatest", "umi-latestanime", "animelatest", "latestanime"]
handler.tags = ["anime"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "animelatest", "alias": ["latestanime"], "category": "anime", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-anime-animelatest": "animelatest", "umi-animelatest": "animelatest", "umi-latestanime": "latestanime", "animelatest": "animelatest", "latestanime": "latestanime"}
export default handler
