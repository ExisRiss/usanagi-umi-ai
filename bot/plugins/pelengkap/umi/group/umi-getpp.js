/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "getpp", "category": "group", "aliasMap": {"umi-group-getpp": "getpp", "umi-getpp": "getpp", "umi-pp": "pp", "umi-profilepic": "profilepic", "umi-avatar": "avatar", "getpp": "getpp", "profilepic": "profilepic", "avatar": "avatar"}, "description": "Ambil foto profil target (mention/reply)", "usage": ".getpp @user", "example": ".getpp @628xxx", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/getpp.js", metadata, m, extra)
handler.help = ["umi-group-getpp @user"]
handler.command = ["umi-group-getpp", "umi-getpp", "umi-pp", "umi-profilepic", "umi-avatar", "getpp", "profilepic", "avatar"]
handler.tags = ["group"]
handler.description = "Ambil foto profil target (mention/reply)"
handler.importSource = "umi"
handler.importConfig = {"name": "getpp", "alias": ["pp", "profilepic", "avatar"], "category": "group", "description": "Ambil foto profil target (mention/reply)", "usage": ".getpp @user", "example": ".getpp @628xxx", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-getpp": "getpp", "umi-getpp": "getpp", "umi-pp": "pp", "umi-profilepic": "profilepic", "umi-avatar": "avatar", "getpp": "getpp", "profilepic": "profilepic", "avatar": "avatar"}
export default handler
