import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "google", "category": "search", "aliasMap": {"umi-search-google": "google", "umi-google": "google", "umi-gsearch": "gsearch", "umi-googlenews": "googlenews", "google": "google", "gsearch": "gsearch", "googlenews": "googlenews"}, "description": "Cari berita di Google News", "usage": ".google <query>", "example": ".google gempa hari ini", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/search/google.js", metadata, m, extra)
handler.help = ["umi-search-google <query>"]
handler.command = ["umi-search-google", "umi-google", "umi-gsearch", "umi-googlenews", "google", "gsearch", "googlenews"]
handler.tags = ["search"]
handler.description = "Cari berita di Google News"
handler.importSource = "umi"
handler.importConfig = {"name": "google", "alias": ["gsearch", "googlenews"], "category": "search", "description": "Cari berita di Google News", "usage": ".google <query>", "example": ".google gempa hari ini", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-search-google": "google", "umi-google": "google", "umi-gsearch": "gsearch", "umi-googlenews": "googlenews", "google": "google", "gsearch": "gsearch", "googlenews": "googlenews"}
export default handler
