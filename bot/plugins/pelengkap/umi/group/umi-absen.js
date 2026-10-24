/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "absen", "category": "group", "aliasMap": {"umi-group-absen": "absen", "umi-absen": "absen", "umi-hadir": "hadir", "umi-present": "present", "hadir": "hadir", "present": "present"}, "description": "Tandai kehadiran di sesi absen", "usage": ".absen", "example": ".absen", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/absen.js", metadata, m, extra)
handler.help = ["umi-group-absen"]
handler.command = ["umi-group-absen", "umi-absen", "umi-hadir", "umi-present", "hadir", "present"]
handler.tags = ["group"]
handler.description = "Tandai kehadiran di sesi absen"
handler.importSource = "umi"
handler.importConfig = {"name": "absen", "alias": ["hadir", "present"], "category": "group", "description": "Tandai kehadiran di sesi absen", "usage": ".absen", "example": ".absen", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-absen": "absen", "umi-absen": "absen", "umi-hadir": "hadir", "umi-present": "present", "hadir": "hadir", "present": "present"}
export default handler
