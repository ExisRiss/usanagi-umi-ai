/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "birthdaylist", "category": "user", "aliasMap": {"umi-user-birthdaylist": "birthdaylist", "umi-birthdaylist": "birthdaylist", "umi-bdaylist": "bdaylist", "umi-listultah": "listultah", "umi-ultahlist": "ultahlist", "birthdaylist": "birthdaylist", "bdaylist": "bdaylist", "listultah": "listultah", "ultahlist": "ultahlist"}, "description": "Lihat daftar ulang tahun member", "usage": ".birthdaylist", "example": ".birthdaylist", "cooldown": 10, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/user/birthdaylist.js", metadata, m, extra)
handler.help = ["umi-user-birthdaylist"]
handler.command = ["umi-user-birthdaylist", "umi-birthdaylist", "umi-bdaylist", "umi-listultah", "umi-ultahlist", "birthdaylist", "bdaylist", "listultah", "ultahlist"]
handler.tags = ["user"]
handler.description = "Lihat daftar ulang tahun member"
handler.importSource = "umi"
handler.importConfig = {"name": "birthdaylist", "alias": ["bdaylist", "listultah", "ultahlist"], "category": "user", "description": "Lihat daftar ulang tahun member", "usage": ".birthdaylist", "example": ".birthdaylist", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 10, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-user-birthdaylist": "birthdaylist", "umi-birthdaylist": "birthdaylist", "umi-bdaylist": "bdaylist", "umi-listultah": "listultah", "umi-ultahlist": "ultahlist", "birthdaylist": "birthdaylist", "bdaylist": "bdaylist", "listultah": "listultah", "ultahlist": "ultahlist"}
export default handler
