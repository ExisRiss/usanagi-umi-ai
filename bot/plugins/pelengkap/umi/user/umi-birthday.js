/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "birthday", "category": "user", "aliasMap": {"umi-user-birthday": "birthday", "umi-birthday": "birthday", "umi-bday": "bday", "umi-ultah": "ultah", "umi-ulangtahun": "ulangtahun", "ulangtahun": "ulangtahun"}, "description": "Lihat ulang tahun member", "usage": ".birthday [@user]", "example": ".birthday @user", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/user/birthday.js", metadata, m, extra)
handler.help = ["umi-user-birthday [@user]"]
handler.command = ["umi-user-birthday", "umi-birthday", "umi-bday", "umi-ultah", "umi-ulangtahun", "ulangtahun"]
handler.tags = ["user"]
handler.description = "Lihat ulang tahun member"
handler.importSource = "umi"
handler.importConfig = {"name": "birthday", "alias": ["bday", "ultah", "ulangtahun"], "category": "user", "description": "Lihat ulang tahun member", "usage": ".birthday [@user]", "example": ".birthday @user", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-user-birthday": "birthday", "umi-birthday": "birthday", "umi-bday": "bday", "umi-ultah": "ultah", "umi-ulangtahun": "ulangtahun", "ulangtahun": "ulangtahun"}
export default handler
