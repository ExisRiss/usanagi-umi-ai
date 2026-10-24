/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "apkcombo", "category": "search", "aliasMap": {"umi-search-apkcombo": "apkcombo", "umi-apkcombo": "apkcombo", "umi-apk": "apk", "umi-apksearch": "apksearch", "apkcombo": "apkcombo", "apk": "apk", "apksearch": "apksearch"}, "description": "Cari APK di ApkCombo", "usage": ".apkcombo <query>", "example": ".apkcombo WhatsApp", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/search/apkcombo.js", metadata, m, extra)
handler.help = ["umi-search-apkcombo <query>"]
handler.command = ["umi-search-apkcombo", "umi-apkcombo", "umi-apk", "umi-apksearch", "apkcombo", "apk", "apksearch"]
handler.tags = ["search"]
handler.description = "Cari APK di ApkCombo"
handler.importSource = "umi"
handler.importConfig = {"name": "apkcombo", "alias": ["apk", "apksearch"], "category": "search", "description": "Cari APK di ApkCombo", "usage": ".apkcombo <query>", "example": ".apkcombo WhatsApp", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-search-apkcombo": "apkcombo", "umi-apkcombo": "apkcombo", "umi-apk": "apk", "umi-apksearch": "apksearch", "apkcombo": "apkcombo", "apk": "apk", "apksearch": "apksearch"}
export default handler
