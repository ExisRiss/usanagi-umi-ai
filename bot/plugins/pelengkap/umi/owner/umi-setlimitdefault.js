import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "setlimitdefault", "category": "owner", "aliasMap": {"umi-owner-setlimitdefault": "setlimitdefault", "umi-setlimitdefault": "setlimitdefault", "umi-setdefaultlimit": "setdefaultlimit", "umi-limitdefault": "limitdefault", "setlimitdefault": "setlimitdefault", "setdefaultlimit": "setdefaultlimit", "limitdefault": "limitdefault"}, "description": "Set default limit untuk user baru", "usage": ".setlimitdefault <jumlah>", "example": ".setlimitdefault 50", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/setlimitdefault.js", metadata, m, extra)
handler.help = ["umi-owner-setlimitdefault <jumlah>"]
handler.command = ["umi-owner-setlimitdefault", "umi-setlimitdefault", "umi-setdefaultlimit", "umi-limitdefault", "setlimitdefault", "setdefaultlimit", "limitdefault"]
handler.tags = ["owner"]
handler.description = "Set default limit untuk user baru"
handler.importSource = "umi"
handler.importConfig = {"name": "setlimitdefault", "alias": ["setdefaultlimit", "limitdefault"], "category": "owner", "description": "Set default limit untuk user baru", "usage": ".setlimitdefault <jumlah>", "example": ".setlimitdefault 50", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-setlimitdefault": "setlimitdefault", "umi-setlimitdefault": "setlimitdefault", "umi-setdefaultlimit": "setdefaultlimit", "umi-limitdefault": "limitdefault", "setlimitdefault": "setlimitdefault", "setdefaultlimit": "setdefaultlimit", "limitdefault": "limitdefault"}
export default handler
