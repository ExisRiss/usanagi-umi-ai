/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "notifsholat", "category": "group", "aliasMap": {"umi-group-notifsholat": "notifsholat", "umi-notifsholat": "notifsholat", "umi-notifsolat": "notifsolat", "notifsholat": "notifsholat", "notifsolat": "notifsolat"}, "description": "Toggle notifikasi sholat untuk grup ini", "usage": ".notifsholat on/off", "example": ".notifsholat on", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/notifsholat.js", metadata, m, extra)
handler.help = ["umi-group-notifsholat on/off"]
handler.command = ["umi-group-notifsholat", "umi-notifsholat", "umi-notifsolat", "notifsholat", "notifsolat"]
handler.tags = ["group"]
handler.description = "Toggle notifikasi sholat untuk grup ini"
handler.importSource = "umi"
handler.importConfig = {"name": "notifsholat", "alias": ["notifsolat"], "category": "group", "description": "Toggle notifikasi sholat untuk grup ini", "usage": ".notifsholat on/off", "example": ".notifsholat on", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-notifsholat": "notifsholat", "umi-notifsholat": "notifsholat", "umi-notifsolat": "notifsolat", "notifsholat": "notifsholat", "notifsolat": "notifsolat"}
export default handler
