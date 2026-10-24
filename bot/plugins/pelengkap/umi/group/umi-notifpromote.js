import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "notifpromote", "category": "group", "aliasMap": {"umi-group-notifpromote": "notifpromote", "umi-notifpromote": "notifpromote", "notifpromote": "notifpromote"}, "description": "Toggle notifikasi saat ada yang dijadikan admin", "usage": ".notifpromote on/off", "example": ".notifpromote on", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/notifpromote.js", metadata, m, extra)
handler.help = ["umi-group-notifpromote on/off"]
handler.command = ["umi-group-notifpromote", "umi-notifpromote", "notifpromote"]
handler.tags = ["group"]
handler.description = "Toggle notifikasi saat ada yang dijadikan admin"
handler.importSource = "umi"
handler.importConfig = {"name": "notifpromote", "alias": [], "category": "group", "description": "Toggle notifikasi saat ada yang dijadikan admin", "usage": ".notifpromote on/off", "example": ".notifpromote on", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-notifpromote": "notifpromote", "umi-notifpromote": "notifpromote", "notifpromote": "notifpromote"}
export default handler
