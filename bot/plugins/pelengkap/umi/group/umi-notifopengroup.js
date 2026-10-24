import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "notifopengroup", "category": "group", "aliasMap": {"umi-group-notifopengroup": "notifopengroup", "umi-notifopengroup": "notifopengroup", "umi-notifopen": "notifopen", "notifopengroup": "notifopengroup", "notifopen": "notifopen"}, "description": "Toggle notifikasi saat grup dibuka", "usage": ".notifopengroup on/off", "example": ".notifopengroup on", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/notifopengroup.js", metadata, m, extra)
handler.help = ["umi-group-notifopengroup on/off"]
handler.command = ["umi-group-notifopengroup", "umi-notifopengroup", "umi-notifopen", "notifopengroup", "notifopen"]
handler.tags = ["group"]
handler.description = "Toggle notifikasi saat grup dibuka"
handler.importSource = "umi"
handler.importConfig = {"name": "notifopengroup", "alias": ["notifopen"], "category": "group", "description": "Toggle notifikasi saat grup dibuka", "usage": ".notifopengroup on/off", "example": ".notifopengroup on", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-notifopengroup": "notifopengroup", "umi-notifopengroup": "notifopengroup", "umi-notifopen": "notifopen", "notifopengroup": "notifopengroup", "notifopen": "notifopen"}
export default handler
