import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "editstok", "category": "store", "aliasMap": {"umi-store-editstok": "editstok", "umi-editstok": "editstok", "umi-editstock": "editstock", "editstok": "editstok", "editstock": "editstock"}, "description": "✏️ Edit stok item produk (hanya di private chat)", "usage": ".editstok <nomor_produk> <nomor_item>|<detail_baru>", "example": ".editstok 1 3|Email: baru@mail.com;;Password: newpass", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/store/editstok.js", metadata, m, extra)
handler.help = ["umi-store-editstok <nomor_produk> <nomor_item>|<detail_baru>"]
handler.command = ["umi-store-editstok", "umi-editstok", "umi-editstock", "editstok", "editstock"]
handler.tags = ["store"]
handler.description = "✏️ Edit stok item produk (hanya di private chat)"
handler.importSource = "umi"
handler.importConfig = {"name": "editstok", "alias": ["editstock"], "category": "store", "description": "✏️ Edit stok item produk (hanya di private chat)", "usage": ".editstok <nomor_produk> <nomor_item>|<detail_baru>", "example": ".editstok 1 3|Email: baru@mail.com;;Password: newpass", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": true, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = true
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-store-editstok": "editstok", "umi-editstok": "editstok", "umi-editstock": "editstock", "editstok": "editstok", "editstock": "editstock"}
export default handler
