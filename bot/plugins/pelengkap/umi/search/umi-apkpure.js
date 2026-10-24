import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "apkpure", "category": "search", "aliasMap": {"umi-search-apkpure": "apkpure", "umi-apkpure": "apkpure", "umi-apkp": "apkp", "apkpure": "apkpure", "apkp": "apkp"}, "description": "Cari APK di ApkPure", "usage": ".apkpure <query>", "example": ".apkpure WhatsApp", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/search/apkpure.js", metadata, m, extra)
handler.help = ["umi-search-apkpure <query>"]
handler.command = ["umi-search-apkpure", "umi-apkpure", "umi-apkp", "apkpure", "apkp"]
handler.tags = ["search"]
handler.description = "Cari APK di ApkPure"
handler.importSource = "umi"
handler.importConfig = {"name": "apkpure", "alias": ["apkp"], "category": "search", "description": "Cari APK di ApkPure", "usage": ".apkpure <query>", "example": ".apkpure WhatsApp", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-search-apkpure": "apkpure", "umi-apkpure": "apkpure", "umi-apkp": "apkp", "apkpure": "apkpure", "apkp": "apkp"}
export default handler
