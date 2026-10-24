/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "hapuslist", "category": "store", "aliasMap": {"umi-store-hapuslist": "hapuslist", "umi-hapuslist": "hapuslist", "umi-dellist": "dellist", "umi-deletelist": "deletelist", "hapuslist": "hapuslist", "deletelist": "deletelist"}, "description": "🗑️ Hapus informasi toko", "usage": ".hapuslist <nomor>", "example": ".hapuslist 1", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/store/hapuslist.js", metadata, m, extra)
handler.help = ["umi-store-hapuslist <nomor>"]
handler.command = ["umi-store-hapuslist", "umi-hapuslist", "umi-dellist", "umi-deletelist", "hapuslist", "deletelist"]
handler.tags = ["store"]
handler.description = "🗑️ Hapus informasi toko"
handler.importSource = "umi"
handler.importConfig = {"name": "hapuslist", "alias": ["dellist", "deletelist"], "category": "store", "description": "🗑️ Hapus informasi toko", "usage": ".hapuslist <nomor>", "example": ".hapuslist 1", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-store-hapuslist": "hapuslist", "umi-hapuslist": "hapuslist", "umi-dellist": "dellist", "umi-deletelist": "deletelist", "hapuslist": "hapuslist", "deletelist": "deletelist"}
export default handler
