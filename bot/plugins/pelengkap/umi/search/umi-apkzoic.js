/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "apkzoic", "category": "search", "aliasMap": {"umi-search-apkzoic": "apkzoic", "umi-apkzoic": "apkzoic", "umi-apkz": "apkz", "apkzoic": "apkzoic", "apkz": "apkz"}, "description": "Cari APK MOD di ApkZoic", "usage": ".apkzoic <query>", "example": ".apkzoic Subway Surfer", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/search/apkzoic.js", metadata, m, extra)
handler.help = ["umi-search-apkzoic <query>"]
handler.command = ["umi-search-apkzoic", "umi-apkzoic", "umi-apkz", "apkzoic", "apkz"]
handler.tags = ["search"]
handler.description = "Cari APK MOD di ApkZoic"
handler.importSource = "umi"
handler.importConfig = {"name": "apkzoic", "alias": ["apkz"], "category": "search", "description": "Cari APK MOD di ApkZoic", "usage": ".apkzoic <query>", "example": ".apkzoic Subway Surfer", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-search-apkzoic": "apkzoic", "umi-apkzoic": "apkzoic", "umi-apkz": "apkz", "apkzoic": "apkzoic", "apkz": "apkz"}
export default handler
