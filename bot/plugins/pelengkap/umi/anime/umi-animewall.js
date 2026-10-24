/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "animewall", "category": "anime", "aliasMap": {"umi-anime-animewall": "animewall", "umi-animewall": "animewall", "umi-animewallpaper": "animewallpaper", "umi-wallanime": "wallanime", "umi-wpanime": "wpanime", "animewall": "animewall", "animewallpaper": "animewallpaper", "wallanime": "wallanime", "wpanime": "wpanime"}, "description": "Dapatkan random wallpaper anime HD dari berbagai series", "usage": ".animewall [series]", "example": ".animewall\n.animewall naruto\n.animewall zero two", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/anime/animewall.js", metadata, m, extra)
handler.help = ["umi-anime-animewall [series]"]
handler.command = ["umi-anime-animewall", "umi-animewall", "umi-animewallpaper", "umi-wallanime", "umi-wpanime", "animewall", "animewallpaper", "wallanime", "wpanime"]
handler.tags = ["anime"]
handler.description = "Dapatkan random wallpaper anime HD dari berbagai series"
handler.importSource = "umi"
handler.importConfig = {"name": "animewall", "alias": ["animewallpaper", "wallanime", "wpanime"], "category": "anime", "description": "Dapatkan random wallpaper anime HD dari berbagai series", "usage": ".animewall [series]", "example": ".animewall\n.animewall naruto\n.animewall zero two", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-anime-animewall": "animewall", "umi-animewall": "animewall", "umi-animewallpaper": "animewallpaper", "umi-wallanime": "wallanime", "umi-wpanime": "wpanime", "animewall": "animewall", "animewallpaper": "animewallpaper", "wallanime": "wallanime", "wpanime": "wpanime"}
export default handler
