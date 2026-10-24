/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "android1-get", "category": "search", "aliasMap": {"umi-search-android1-get": "android1-get", "umi-android1-get": "android1-get", "umi-an1get": "an1get", "umi-an1dl": "an1dl", "android1-get": "android1-get", "an1get": "an1get", "an1dl": "an1dl"}, "description": "Download APK dari Android1", "usage": ".android1-get <url>", "example": ".android1-get https://an1.com/xxx", "cooldown": 15, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/search/android1-get.js", metadata, m, extra)
handler.help = ["umi-search-android1-get <url>"]
handler.command = ["umi-search-android1-get", "umi-android1-get", "umi-an1get", "umi-an1dl", "android1-get", "an1get", "an1dl"]
handler.tags = ["search"]
handler.description = "Download APK dari Android1"
handler.importSource = "umi"
handler.importConfig = {"name": "android1-get", "alias": ["an1get", "an1dl"], "category": "search", "description": "Download APK dari Android1", "usage": ".android1-get <url>", "example": ".android1-get https://an1.com/xxx", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 15, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-search-android1-get": "android1-get", "umi-android1-get": "android1-get", "umi-an1get": "an1get", "umi-an1dl": "an1dl", "android1-get": "android1-get", "an1get": "an1get", "an1dl": "an1dl"}
export default handler
