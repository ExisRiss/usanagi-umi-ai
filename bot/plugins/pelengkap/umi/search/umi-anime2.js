/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "anime2", "category": "search", "aliasMap": {"umi-search-anime2": "anime2", "umi-anime2": "anime2", "umi-animeku2": "animeku2", "umi-nime2": "nime2", "umi-ani2": "ani2", "anime2": "anime2", "animeku2": "animeku2", "nime2": "nime2", "ani2": "ani2"}, "description": "Cari info anime, streaming, download", "usage": ".anime <subcommand>", "example": ".anime search naruto", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/search/anime2.js", metadata, m, extra)
handler.help = ["umi-search-anime2 <subcommand>"]
handler.command = ["umi-search-anime2", "umi-anime2", "umi-animeku2", "umi-nime2", "umi-ani2", "anime2", "animeku2", "nime2", "ani2"]
handler.tags = ["search"]
handler.description = "Cari info anime, streaming, download"
handler.importSource = "umi"
handler.importConfig = {"name": "anime2", "alias": ["animeku2", "nime2", "ani2"], "category": "search", "description": "Cari info anime, streaming, download", "usage": ".anime <subcommand>", "example": ".anime search naruto", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-search-anime2": "anime2", "umi-anime2": "anime2", "umi-animeku2": "animeku2", "umi-nime2": "nime2", "umi-ani2": "ani2", "anime2": "anime2", "animeku2": "animeku2", "nime2": "nime2", "ani2": "ani2"}
export default handler
