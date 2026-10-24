/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "anime-waifu, Waifu-anime", "category": "anime", "aliasMap": {"umi-anime-anime-waifu, waifu-anime": "anime-waifu, waifu-anime", "umi-randomwaifu": "randomwaifu", "umi-waifurandom": "waifurandom", "umi-waifupic": "waifupic", "randomwaifu": "randomwaifu", "waifurandom": "waifurandom", "waifupic": "waifupic"}, "description": "Random gambar waifu dari berbagai sumber", "usage": ".waifu", "example": ".waifu", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/anime/waifu_anime.js", metadata, m, extra)
handler.help = ["umi-anime-anime-waifu, waifu-anime"]
handler.command = ["umi-anime-anime-waifu, waifu-anime", "umi-randomwaifu", "umi-waifurandom", "umi-waifupic", "randomwaifu", "waifurandom", "waifupic"]
handler.tags = ["anime"]
handler.description = "Random gambar waifu dari berbagai sumber"
handler.importSource = "umi"
handler.importConfig = {"name": "anime-waifu, Waifu-anime", "alias": ["randomwaifu", "waifurandom", "waifupic"], "category": "anime", "description": "Random gambar waifu dari berbagai sumber", "usage": ".waifu", "example": ".waifu", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-anime-anime-waifu, waifu-anime": "anime-waifu, waifu-anime", "umi-randomwaifu": "randomwaifu", "umi-waifurandom": "waifurandom", "umi-waifupic": "waifupic", "randomwaifu": "randomwaifu", "waifurandom": "waifurandom", "waifupic": "waifupic"}
export default handler
