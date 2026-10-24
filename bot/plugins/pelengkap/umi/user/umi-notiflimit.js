/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "notiflimit", "category": "owner", "aliasMap": {"umi-owner-notiflimit": "notiflimit", "umi-notiflimit": "notiflimit", "umi-notifenergi": "notifenergi", "notiflimit": "notiflimit", "notifenergi": "notifenergi"}, "description": "Mengaktifkan atau mematikan notifikasi potong limit secara global.", "usage": ".notiflimit", "example": ".notiflimit", "cooldown": 0, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/user/notiflimit.js", metadata, m, extra)
handler.help = ["umi-owner-notiflimit"]
handler.command = ["umi-owner-notiflimit", "umi-notiflimit", "umi-notifenergi", "notiflimit", "notifenergi"]
handler.tags = ["owner"]
handler.description = "Mengaktifkan atau mematikan notifikasi potong limit secara global."
handler.importSource = "umi"
handler.importConfig = {"name": "notiflimit", "alias": ["notifenergi"], "category": "owner", "description": "Mengaktifkan atau mematikan notifikasi potong limit secara global.", "usage": ".notiflimit", "example": ".notiflimit", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 0, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-notiflimit": "notiflimit", "umi-notiflimit": "notiflimit", "umi-notifenergi": "notifenergi", "notiflimit": "notiflimit", "notifenergi": "notifenergi"}
export default handler
