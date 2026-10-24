import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "animeapaini", "category": "search", "aliasMap": {"umi-search-animeapaini": "animeapaini", "umi-animeapaini": "animeapaini", "umi-whatanime": "whatanime", "umi-animesearch": "animesearch", "umi-sauceanime": "sauceanime", "umi-searchanime": "searchanime", "umi-anime-checker": "anime-checker", "umi-animechecker": "animechecker", "animeapaini": "animeapaini", "whatanime": "whatanime", "animesearch": "animesearch", "sauceanime": "sauceanime", "searchanime": "searchanime", "anime-checker": "anime-checker", "animechecker": "animechecker"}, "description": "Identifikasi judul anime dari gambar/screenshot", "usage": ".animeapaini (reply gambar)", "example": ".animeapaini", "cooldown": 15, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/search/animeapaini.js", metadata, m, extra)
handler.help = ["umi-search-animeapaini (reply gambar)"]
handler.command = ["umi-search-animeapaini", "umi-animeapaini", "umi-whatanime", "umi-animesearch", "umi-sauceanime", "umi-searchanime", "umi-anime-checker", "umi-animechecker", "animeapaini", "whatanime", "animesearch", "sauceanime", "searchanime", "anime-checker", "animechecker"]
handler.tags = ["search"]
handler.description = "Identifikasi judul anime dari gambar/screenshot"
handler.importSource = "umi"
handler.importConfig = {"name": "animeapaini", "alias": ["whatanime", "animesearch", "sauceanime", "searchanime", "anime-checker", "animechecker"], "category": "search", "description": "Identifikasi judul anime dari gambar/screenshot", "usage": ".animeapaini (reply gambar)", "example": ".animeapaini", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 15, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-search-animeapaini": "animeapaini", "umi-animeapaini": "animeapaini", "umi-whatanime": "whatanime", "umi-animesearch": "animesearch", "umi-sauceanime": "sauceanime", "umi-searchanime": "searchanime", "umi-anime-checker": "anime-checker", "umi-animechecker": "animechecker", "animeapaini": "animeapaini", "whatanime": "whatanime", "animesearch": "animesearch", "sauceanime": "sauceanime", "searchanime": "searchanime", "anime-checker": "anime-checker", "animechecker": "animechecker"}
export default handler
