import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "hapususer", "category": "owner", "aliasMap": {"umi-owner-hapususer": "hapususer", "umi-hapususer": "hapususer", "umi-deluser": "deluser", "umi-deleteuser": "deleteuser", "hapususer": "hapususer", "deluser": "deluser", "deleteuser": "deleteuser"}, "description": "Hapus user dari database", "usage": ".hapususer", "cooldown": 5}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/hapususer.js", metadata, m, extra)
handler.help = ["umi-owner-hapususer"]
handler.command = ["umi-owner-hapususer", "umi-hapususer", "umi-deluser", "umi-deleteuser", "hapususer", "deluser", "deleteuser"]
handler.tags = ["owner"]
handler.description = "Hapus user dari database"
handler.importSource = "umi"
handler.importConfig = {"name": "hapususer", "alias": ["deluser", "deleteuser"], "category": "owner", "description": "Hapus user dari database", "usage": ".hapususer", "isOwner": true, "cooldown": 5, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-hapususer": "hapususer", "umi-hapususer": "hapususer", "umi-deluser": "deluser", "umi-deleteuser": "deleteuser", "hapususer": "hapususer", "deluser": "deluser", "deleteuser": "deleteuser"}
export default handler
