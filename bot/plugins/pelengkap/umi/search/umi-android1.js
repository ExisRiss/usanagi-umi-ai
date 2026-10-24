/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "android1", "category": "search", "aliasMap": {"umi-search-android1": "android1", "umi-android1": "android1", "umi-an1": "an1", "android1": "android1", "an1": "an1"}, "description": "Cari dan download APK MOD dari Android1", "usage": ".android1 <query>", "example": ".android1 Subway Surfer", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/search/android1.js", metadata, m, extra)
handler.help = ["umi-search-android1 <query>"]
handler.command = ["umi-search-android1", "umi-android1", "umi-an1", "android1", "an1"]
handler.tags = ["search"]
handler.description = "Cari dan download APK MOD dari Android1"
handler.importSource = "umi"
handler.importConfig = {"name": "android1", "alias": ["an1"], "category": "search", "description": "Cari dan download APK MOD dari Android1", "usage": ".android1 <query>", "example": ".android1 Subway Surfer", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-search-android1": "android1", "umi-android1": "android1", "umi-an1": "an1", "android1": "android1", "an1": "an1"}
export default handler
