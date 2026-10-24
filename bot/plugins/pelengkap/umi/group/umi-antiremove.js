import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "antiremove", "category": "group", "aliasMap": {"umi-group-antiremove": "antiremove", "umi-antiremove": "antiremove", "umi-antidelete": "antidelete", "umi-antihapus": "antihapus", "umi-ar": "ar", "antiremove": "antiremove", "antidelete": "antidelete", "antihapus": "antihapus", "ar": "ar"}, "description": "Mengaktifkan/menonaktifkan anti hapus pesan di grup", "usage": ".antiremove <on/off>", "example": ".antiremove on", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/antiremove.js", metadata, m, extra)
handler.help = ["umi-group-antiremove <on/off>"]
handler.command = ["umi-group-antiremove", "umi-antiremove", "umi-antidelete", "umi-antihapus", "umi-ar", "antiremove", "antidelete", "antihapus", "ar"]
handler.tags = ["group"]
handler.description = "Mengaktifkan/menonaktifkan anti hapus pesan di grup"
handler.importSource = "umi"
handler.importConfig = {"name": "antiremove", "alias": ["antidelete", "antihapus", "ar"], "category": "group", "description": "Mengaktifkan/menonaktifkan anti hapus pesan di grup", "usage": ".antiremove <on/off>", "example": ".antiremove on", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true, "isAdmin": true, "isBotAdmin": false}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = true
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-antiremove": "antiremove", "umi-antiremove": "antiremove", "umi-antidelete": "antidelete", "umi-antihapus": "antihapus", "umi-ar": "ar", "antiremove": "antiremove", "antidelete": "antidelete", "antihapus": "antihapus", "ar": "ar"}
export default handler
