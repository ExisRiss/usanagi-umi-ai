import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "autoread", "category": "owner", "aliasMap": {"umi-owner-autoread": "autoread", "umi-autoread": "autoread", "umi-readchat": "readchat", "umi-autobaca": "autobaca", "autoread": "autoread", "readchat": "readchat", "autobaca": "autobaca"}, "description": "Auto read pesan masuk", "usage": ".autoread on/off", "example": ".autoread on", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/autoread.js", metadata, m, extra)
handler.help = ["umi-owner-autoread on/off"]
handler.command = ["umi-owner-autoread", "umi-autoread", "umi-readchat", "umi-autobaca", "autoread", "readchat", "autobaca"]
handler.tags = ["owner"]
handler.description = "Auto read pesan masuk"
handler.importSource = "umi"
handler.importConfig = {"name": "autoread", "alias": ["readchat", "autobaca"], "category": "owner", "description": "Auto read pesan masuk", "usage": ".autoread on/off", "example": ".autoread on", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-autoread": "autoread", "umi-autoread": "autoread", "umi-readchat": "readchat", "umi-autobaca": "autobaca", "autoread": "autoread", "readchat": "readchat", "autobaca": "autobaca"}
export default handler
