/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cekonline", "category": "group", "aliasMap": {"umi-group-cekonline": "cekonline", "umi-cekonline": "cekonline", "umi-checkonline": "checkonline", "umi-online": "online", "umi-siapayangonline": "siapayangonline", "umi-whosonline": "whosonline", "cekonline": "cekonline", "checkonline": "checkonline", "online": "online", "siapayangonline": "siapayangonline", "whosonline": "whosonline"}, "description": "Cek member yang online di grup", "usage": ".cekonline", "example": ".cekonline", "cooldown": 60, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/cekonline.js", metadata, m, extra)
handler.help = ["umi-group-cekonline"]
handler.command = ["umi-group-cekonline", "umi-cekonline", "umi-checkonline", "umi-online", "umi-siapayangonline", "umi-whosonline", "cekonline", "checkonline", "online", "siapayangonline", "whosonline"]
handler.tags = ["group"]
handler.description = "Cek member yang online di grup"
handler.importSource = "umi"
handler.importConfig = {"name": "cekonline", "alias": ["checkonline", "online", "siapayangonline", "whosonline"], "category": "group", "description": "Cek member yang online di grup", "usage": ".cekonline", "example": ".cekonline", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 60, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-group-cekonline": "cekonline", "umi-cekonline": "cekonline", "umi-checkonline": "checkonline", "umi-online": "online", "umi-siapayangonline": "siapayangonline", "umi-whosonline": "whosonline", "cekonline": "cekonline", "checkonline": "checkonline", "online": "online", "siapayangonline": "siapayangonline", "whosonline": "whosonline"}
export default handler
