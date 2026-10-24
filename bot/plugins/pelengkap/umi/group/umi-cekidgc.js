/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cekidgc", "category": "group", "aliasMap": {"umi-group-cekidgc": "cekidgc", "umi-cekidgc": "cekidgc", "umi-idgc": "idgc", "umi-idgrup": "idgrup", "umi-groupid": "groupid", "umi-infogc": "infogc", "idgrup": "idgrup", "groupid": "groupid", "infogc": "infogc"}, "description": "Cek ID dan info lengkap grup", "usage": ".cekidgc [link grup]", "example": ".cekidgc https://chat.whatsapp.com/xxxxx", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/cekidgc.js", metadata, m, extra)
handler.help = ["umi-group-cekidgc [link grup]"]
handler.command = ["umi-group-cekidgc", "umi-cekidgc", "umi-idgc", "umi-idgrup", "umi-groupid", "umi-infogc", "idgrup", "groupid", "infogc"]
handler.tags = ["group"]
handler.description = "Cek ID dan info lengkap grup"
handler.importSource = "umi"
handler.importConfig = {"name": "cekidgc", "alias": ["idgc", "idgrup", "groupid", "infogc", "groupinfo"], "category": "group", "description": "Cek ID dan info lengkap grup", "usage": ".cekidgc [link grup]", "example": ".cekidgc https://chat.whatsapp.com/xxxxx", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "isAdmin": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-cekidgc": "cekidgc", "umi-cekidgc": "cekidgc", "umi-idgc": "idgc", "umi-idgrup": "idgrup", "umi-groupid": "groupid", "umi-infogc": "infogc", "idgrup": "idgrup", "groupid": "groupid", "infogc": "infogc"}
export default handler
