/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "list", "category": "store", "aliasMap": {"umi-store-list": "list", "umi-list": "list", "umi-liststore": "liststore", "umi-daftar": "daftar", "umi-info": "info", "info": "info"}, "description": "📋 Lihat daftar informasi toko", "usage": ".list atau .list <nomor>", "example": ".list 1", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/store/list.js", metadata, m, extra)
handler.help = ["umi-store-list atau .list <nomor>"]
handler.command = ["umi-store-list", "umi-list", "umi-liststore", "umi-daftar", "umi-info", "info"]
handler.tags = ["store"]
handler.description = "📋 Lihat daftar informasi toko"
handler.importSource = "umi"
handler.importConfig = {"name": "list", "alias": ["liststore", "daftar", "info"], "category": "store", "description": "📋 Lihat daftar informasi toko", "usage": ".list atau .list <nomor>", "example": ".list 1", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-store-list": "list", "umi-list": "list", "umi-liststore": "liststore", "umi-daftar": "daftar", "umi-info": "info", "info": "info"}
export default handler
