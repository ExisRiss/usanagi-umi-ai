import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "listban", "category": "owner", "aliasMap": {"umi-owner-listban": "listban", "umi-listban": "listban", "umi-listbanned": "listbanned", "umi-banlist": "banlist", "listban": "listban", "listbanned": "listbanned", "banlist": "banlist"}, "description": "Melihat daftar banned user", "usage": ".listban", "example": ".listban", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/listban.js", metadata, m, extra)
handler.help = ["umi-owner-listban"]
handler.command = ["umi-owner-listban", "umi-listban", "umi-listbanned", "umi-banlist", "listban", "listbanned", "banlist"]
handler.tags = ["owner"]
handler.description = "Melihat daftar banned user"
handler.importSource = "umi"
handler.importConfig = {"name": "listban", "alias": ["listbanned", "banlist"], "category": "owner", "description": "Melihat daftar banned user", "usage": ".listban", "example": ".listban", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-listban": "listban", "umi-listban": "listban", "umi-listbanned": "listbanned", "umi-banlist": "banlist", "listban": "listban", "listbanned": "listbanned", "banlist": "banlist"}
export default handler
