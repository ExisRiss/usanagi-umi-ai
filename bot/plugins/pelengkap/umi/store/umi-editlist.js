import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "editlist", "category": "store", "aliasMap": {"umi-store-editlist": "editlist", "umi-editlist": "editlist", "umi-editinfo": "editinfo", "editlist": "editlist", "editinfo": "editinfo"}, "description": "✏️ Edit informasi toko (hanya di private chat)", "usage": ".editlist <nomor> <field> <nilai>", "example": ".editlist 1 isi Konten baru di sini", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/store/editlist.js", metadata, m, extra)
handler.help = ["umi-store-editlist <nomor> <field> <nilai>"]
handler.command = ["umi-store-editlist", "umi-editlist", "umi-editinfo", "editlist", "editinfo"]
handler.tags = ["store"]
handler.description = "✏️ Edit informasi toko (hanya di private chat)"
handler.importSource = "umi"
handler.importConfig = {"name": "editlist", "alias": ["editinfo"], "category": "store", "description": "✏️ Edit informasi toko (hanya di private chat)", "usage": ".editlist <nomor> <field> <nilai>", "example": ".editlist 1 isi Konten baru di sini", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": true, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = true
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-store-editlist": "editlist", "umi-editlist": "editlist", "umi-editinfo": "editinfo", "editlist": "editlist", "editinfo": "editinfo"}
export default handler
