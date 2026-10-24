import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "autoaddstok", "category": "store_autoorder", "aliasMap": {"umi-store_autoorder-autoaddstok": "autoaddstok", "umi-autoaddstok": "autoaddstok", "umi-autotambahstok": "autotambahstok", "autoaddstok": "autoaddstok", "autotambahstok": "autotambahstok"}, "description": "📦 Menambah stok digital ke produk", "usage": ".autoaddstok <id_produk/nomor> | <data_stok>", "example": ".autoaddstok 1 | email:pass:profile", "cooldown": 0, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/store_autoorder/addstok.js", metadata, m, extra)
handler.help = ["umi-store_autoorder-autoaddstok <id_produk/nomor> | <data_stok>"]
handler.command = ["umi-store_autoorder-autoaddstok", "umi-autoaddstok", "umi-autotambahstok", "autoaddstok", "autotambahstok"]
handler.tags = ["store_autoorder"]
handler.description = "📦 Menambah stok digital ke produk"
handler.importSource = "umi"
handler.importConfig = {"name": "autoaddstok", "alias": ["autotambahstok"], "category": "store_autoorder", "description": "📦 Menambah stok digital ke produk", "usage": ".autoaddstok <id_produk/nomor> | <data_stok>", "example": ".autoaddstok 1 | email:pass:profile", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 0, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-store_autoorder-autoaddstok": "autoaddstok", "umi-autoaddstok": "autoaddstok", "umi-autotambahstok": "autotambahstok", "autoaddstok": "autoaddstok", "autotambahstok": "autotambahstok"}
export default handler
