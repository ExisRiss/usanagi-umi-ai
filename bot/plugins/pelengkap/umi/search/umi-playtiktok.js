import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "playtiktok", "category": "search", "aliasMap": {"umi-search-playtiktok": "playtiktok", "umi-playtiktok": "playtiktok", "umi-ttplay": "ttplay", "umi-tiktokplay": "tiktokplay", "playtiktok": "playtiktok", "ttplay": "ttplay", "tiktokplay": "tiktokplay"}, "description": "Cari dan kirim satu video TikTok terbaik", "usage": ".playtiktok <query>", "example": ".playtiktok cewe tiktok", "cooldown": 15, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/search/playtiktok.js", metadata, m, extra)
handler.help = ["umi-search-playtiktok <query>"]
handler.command = ["umi-search-playtiktok", "umi-playtiktok", "umi-ttplay", "umi-tiktokplay", "playtiktok", "ttplay", "tiktokplay"]
handler.tags = ["search"]
handler.description = "Cari dan kirim satu video TikTok terbaik"
handler.importSource = "umi"
handler.importConfig = {"name": "playtiktok", "alias": ["ttplay", "tiktokplay"], "category": "search", "description": "Cari dan kirim satu video TikTok terbaik", "usage": ".playtiktok <query>", "example": ".playtiktok cewe tiktok", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 15, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-search-playtiktok": "playtiktok", "umi-playtiktok": "playtiktok", "umi-ttplay": "ttplay", "umi-tiktokplay": "tiktokplay", "playtiktok": "playtiktok", "ttplay": "ttplay", "tiktokplay": "tiktokplay"}
export default handler
