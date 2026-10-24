import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "notifdemote", "category": "group", "aliasMap": {"umi-group-notifdemote": "notifdemote", "umi-notifdemote": "notifdemote", "notifdemote": "notifdemote"}, "description": "Toggle notifikasi saat ada yang dicopot dari admin", "usage": ".notifdemote on/off", "example": ".notifdemote on", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/notifdemote.js", metadata, m, extra)
handler.help = ["umi-group-notifdemote on/off"]
handler.command = ["umi-group-notifdemote", "umi-notifdemote", "notifdemote"]
handler.tags = ["group"]
handler.description = "Toggle notifikasi saat ada yang dicopot dari admin"
handler.importSource = "umi"
handler.importConfig = {"name": "notifdemote", "alias": [], "category": "group", "description": "Toggle notifikasi saat ada yang dicopot dari admin", "usage": ".notifdemote on/off", "example": ".notifdemote on", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-notifdemote": "notifdemote", "umi-notifdemote": "notifdemote", "notifdemote": "notifdemote"}
export default handler
