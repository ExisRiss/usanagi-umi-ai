import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "apkmod-get", "category": "search", "aliasMap": {"umi-search-apkmod-get": "apkmod-get", "umi-apkmod-get": "apkmod-get", "umi-apkmodget": "apkmodget", "umi-getapkmod": "getapkmod", "apkmod-get": "apkmod-get", "apkmodget": "apkmodget", "getapkmod": "getapkmod"}, "description": "Download APK MOD dari hasil pencarian", "usage": ".apkmod-get <no> <query>", "example": ".apkmod-get 1 vpn", "cooldown": 15, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/search/apkmod-get.js", metadata, m, extra)
handler.help = ["umi-search-apkmod-get <no> <query>"]
handler.command = ["umi-search-apkmod-get", "umi-apkmod-get", "umi-apkmodget", "umi-getapkmod", "apkmod-get", "apkmodget", "getapkmod"]
handler.tags = ["search"]
handler.description = "Download APK MOD dari hasil pencarian"
handler.importSource = "umi"
handler.importConfig = {"name": "apkmod-get", "alias": ["apkmodget", "getapkmod"], "category": "search", "description": "Download APK MOD dari hasil pencarian", "usage": ".apkmod-get <no> <query>", "example": ".apkmod-get 1 vpn", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 15, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-search-apkmod-get": "apkmod-get", "umi-apkmod-get": "apkmod-get", "umi-apkmodget": "apkmodget", "umi-getapkmod": "getapkmod", "apkmod-get": "apkmod-get", "apkmodget": "apkmodget", "getapkmod": "getapkmod"}
export default handler
