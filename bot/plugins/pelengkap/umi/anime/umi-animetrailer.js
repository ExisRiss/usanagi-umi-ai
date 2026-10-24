import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "animetrailer", "category": "anime", "aliasMap": {"umi-anime-animetrailer": "animetrailer", "umi-animetrailer": "animetrailer", "umi-traileranime": "traileranime", "umi-animepv": "animepv", "umi-animepromo": "animepromo", "animetrailer": "animetrailer", "traileranime": "traileranime", "animepv": "animepv", "animepromo": "animepromo"}, "description": "Cari dan share trailer / PV anime terbaru dari YouTube", "usage": ".animetrailer <judul anime>", "example": ".animetrailer jujutsu kaisen\n.animetrailer chainsaw man\n.animetrailer one piece", "cooldown": 8, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/anime/animetrailer.js", metadata, m, extra)
handler.help = ["umi-anime-animetrailer <judul anime>"]
handler.command = ["umi-anime-animetrailer", "umi-animetrailer", "umi-traileranime", "umi-animepv", "umi-animepromo", "animetrailer", "traileranime", "animepv", "animepromo"]
handler.tags = ["anime"]
handler.description = "Cari dan share trailer / PV anime terbaru dari YouTube"
handler.importSource = "umi"
handler.importConfig = {"name": "animetrailer", "alias": ["traileranime", "animepv", "animepromo"], "category": "anime", "description": "Cari dan share trailer / PV anime terbaru dari YouTube", "usage": ".animetrailer <judul anime>", "example": ".animetrailer jujutsu kaisen\n.animetrailer chainsaw man\n.animetrailer one piece", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 8, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-anime-animetrailer": "animetrailer", "umi-animetrailer": "animetrailer", "umi-traileranime": "traileranime", "umi-animepv": "animepv", "umi-animepromo": "animepromo", "animetrailer": "animetrailer", "traileranime": "traileranime", "animepv": "animepv", "animepromo": "animepromo"}
export default handler
