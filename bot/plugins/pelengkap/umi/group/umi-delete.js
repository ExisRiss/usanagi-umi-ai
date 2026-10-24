import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "delete", "category": "group", "aliasMap": {"umi-group-delete": "delete", "umi-delete": "delete", "umi-del": "del", "umi-hapus": "hapus", "umi-d": "d"}, "description": "Hapus pesan dengan reply", "usage": ".delete (reply pesan)", "example": ".delete", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/delete.js", metadata, m, extra)
handler.help = ["umi-group-delete (reply pesan)"]
handler.command = ["umi-group-delete", "umi-delete", "umi-del", "umi-hapus", "umi-d"]
handler.tags = ["group"]
handler.description = "Hapus pesan dengan reply"
handler.importSource = "umi"
handler.importConfig = {"name": "delete", "alias": ["del", "hapus", "d"], "category": "group", "description": "Hapus pesan dengan reply", "usage": ".delete (reply pesan)", "example": ".delete", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "isAdmin": true, "isBotAdmin": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = true
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-delete": "delete", "umi-delete": "delete", "umi-del": "del", "umi-hapus": "hapus", "umi-d": "d"}
export default handler
