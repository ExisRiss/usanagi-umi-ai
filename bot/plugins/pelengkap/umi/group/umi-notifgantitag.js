/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "notifgantitag", "category": "group", "aliasMap": {"umi-group-notifgantitag": "notifgantitag", "umi-notifgantitag": "notifgantitag", "umi-notiflabel": "notiflabel", "umi-notiftag": "notiftag", "umi-labeltag": "labeltag", "notifgantitag": "notifgantitag", "notiflabel": "notiflabel", "notiftag": "notiftag", "labeltag": "labeltag"}, "description": "Mengatur notifikasi perubahan label/tag member", "usage": ".notifgantitag <on/off>", "example": ".notifgantitag on", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/notifgantitag.js", metadata, m, extra)
handler.help = ["umi-group-notifgantitag <on/off>"]
handler.command = ["umi-group-notifgantitag", "umi-notifgantitag", "umi-notiflabel", "umi-notiftag", "umi-labeltag", "notifgantitag", "notiflabel", "notiftag", "labeltag"]
handler.tags = ["group"]
handler.description = "Mengatur notifikasi perubahan label/tag member"
handler.importSource = "umi"
handler.importConfig = {"name": "notifgantitag", "alias": ["notiflabel", "notiftag", "labeltag"], "category": "group", "description": "Mengatur notifikasi perubahan label/tag member", "usage": ".notifgantitag <on/off>", "example": ".notifgantitag on", "isGroup": true, "isAdmin": true, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = true
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-notifgantitag": "notifgantitag", "umi-notifgantitag": "notifgantitag", "umi-notiflabel": "notiflabel", "umi-notiftag": "notiftag", "umi-labeltag": "labeltag", "notifgantitag": "notifgantitag", "notiflabel": "notiflabel", "notiftag": "notiftag", "labeltag": "labeltag"}
export default handler
