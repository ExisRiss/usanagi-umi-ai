/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "add", "category": "group", "aliasMap": {"umi-group-add": "add", "umi-add": "add", "umi-addmember": "addmember", "umi-invite": "invite", "addmember": "addmember", "invite": "invite"}, "description": "Menambahkan member ke grup (support multiple)", "usage": ".add <nomor1> [nomor2] [nomor3]... [link_grup]", "example": ".add 6281234567890 6281234567890", "cooldown": 10, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/add.js", metadata, m, extra)
handler.help = ["umi-group-add <nomor1> [nomor2] [nomor3]... [link_grup]"]
handler.command = ["umi-group-add", "umi-add", "umi-addmember", "umi-invite", "addmember", "invite"]
handler.tags = ["group"]
handler.description = "Menambahkan member ke grup (support multiple)"
handler.importSource = "umi"
handler.importConfig = {"name": "add", "alias": ["addmember", "invite"], "category": "group", "description": "Menambahkan member ke grup (support multiple)", "usage": ".add <nomor1> [nomor2] [nomor3]... [link_grup]", "example": ".add 6281234567890 6281234567890", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 0, "isEnabled": true, "isAdmin": true, "isBotAdmin": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = true
handler.botAdmin = true
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-add": "add", "umi-add": "add", "umi-addmember": "addmember", "umi-invite": "invite", "addmember": "addmember", "invite": "invite"}
export default handler
