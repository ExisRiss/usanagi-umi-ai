/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "jadwalgroup", "category": "group", "aliasMap": {"umi-group-jadwalgroup": "jadwalgroup", "umi-jadwalgroup": "jadwalgroup", "umi-schedulegroup": "schedulegroup", "umi-jdwlgrup": "jdwlgrup", "umi-autoopenclose": "autoopenclose", "jadwalgroup": "jadwalgroup", "schedulegroup": "schedulegroup", "jdwlgrup": "jdwlgrup", "autoopenclose": "autoopenclose"}, "description": "Jadwal buka/tutup grup otomatis", "usage": ".jadwalgroup <open/close> <HH:MM>", "example": ".jadwalgroup open 06:00", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/jadwalgroup.js", metadata, m, extra)
handler.help = ["umi-group-jadwalgroup <open/close> <HH:MM>"]
handler.command = ["umi-group-jadwalgroup", "umi-jadwalgroup", "umi-schedulegroup", "umi-jdwlgrup", "umi-autoopenclose", "jadwalgroup", "schedulegroup", "jdwlgrup", "autoopenclose"]
handler.tags = ["group"]
handler.description = "Jadwal buka/tutup grup otomatis"
handler.importSource = "umi"
handler.importConfig = {"name": "jadwalgroup", "alias": ["schedulegroup", "jdwlgrup", "autoopenclose"], "category": "group", "description": "Jadwal buka/tutup grup otomatis", "usage": ".jadwalgroup <open/close> <HH:MM>", "example": ".jadwalgroup open 06:00", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true, "isAdmin": true, "isBotAdmin": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = true
handler.botAdmin = true
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-jadwalgroup": "jadwalgroup", "umi-jadwalgroup": "jadwalgroup", "umi-schedulegroup": "schedulegroup", "umi-jdwlgrup": "jdwlgrup", "umi-autoopenclose": "autoopenclose", "jadwalgroup": "jadwalgroup", "schedulegroup": "schedulegroup", "jdwlgrup": "jdwlgrup", "autoopenclose": "autoopenclose"}
export default handler
