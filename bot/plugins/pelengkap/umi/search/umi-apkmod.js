/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "apkmod", "category": "search", "aliasMap": {"umi-search-apkmod": "apkmod", "umi-apkmod": "apkmod", "umi-modapk2": "modapk2", "umi-apkpremium": "apkpremium", "apkmod": "apkmod", "modapk2": "modapk2", "apkpremium": "apkpremium"}, "description": "Cari dan download APK MOD Premium", "usage": ".apkmod <query>", "example": ".apkmod vpn", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/search/apkmod.js", metadata, m, extra)
handler.help = ["umi-search-apkmod <query>"]
handler.command = ["umi-search-apkmod", "umi-apkmod", "umi-modapk2", "umi-apkpremium", "apkmod", "modapk2", "apkpremium"]
handler.tags = ["search"]
handler.description = "Cari dan download APK MOD Premium"
handler.importSource = "umi"
handler.importConfig = {"name": "apkmod", "alias": ["modapk2", "apkpremium"], "category": "search", "description": "Cari dan download APK MOD Premium", "usage": ".apkmod <query>", "example": ".apkmod vpn", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-search-apkmod": "apkmod", "umi-apkmod": "apkmod", "umi-modapk2": "modapk2", "umi-apkpremium": "apkpremium", "apkmod": "apkmod", "modapk2": "modapk2", "apkpremium": "apkpremium"}
export default handler
