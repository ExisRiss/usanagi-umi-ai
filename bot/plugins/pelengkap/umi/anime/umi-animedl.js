/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "animedl", "category": "anime", "aliasMap": {"umi-anime-animedl": "animedl", "umi-animedl": "animedl", "umi-anime-download": "anime-download", "umi-animedownload": "animedownload", "umi-dlanime": "dlanime", "animedl": "animedl", "anime-download": "anime-download", "animedownload": "animedownload", "dlanime": "dlanime"}, "description": "Download anime batch/single episode dari Kusonime", "usage": ".animedl <judul | eps>", "example": ".animedl jujutsu kaisen season 2 | 1", "cooldown": 15, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/anime/animedl.js", metadata, m, extra)
handler.help = ["umi-anime-animedl <judul | eps>"]
handler.command = ["umi-anime-animedl", "umi-animedl", "umi-anime-download", "umi-animedownload", "umi-dlanime", "animedl", "anime-download", "animedownload", "dlanime"]
handler.tags = ["anime"]
handler.description = "Download anime batch/single episode dari Kusonime"
handler.importSource = "umi"
handler.importConfig = {"name": "animedl", "alias": ["anime-download", "animedownload", "dlanime"], "category": "anime", "description": "Download anime batch/single episode dari Kusonime", "usage": ".animedl <judul | eps>", "example": ".animedl jujutsu kaisen season 2 | 1", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 15, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-anime-animedl": "animedl", "umi-animedl": "animedl", "umi-anime-download": "anime-download", "umi-animedownload": "animedownload", "umi-dlanime": "dlanime", "animedl": "animedl", "anime-download": "anime-download", "animedownload": "animedownload", "dlanime": "dlanime"}
export default handler
