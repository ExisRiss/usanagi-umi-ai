import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "addlist", "category": "store", "aliasMap": {"umi-store-addlist": "addlist", "umi-addlist": "addlist", "umi-addinfo": "addinfo", "addinfo": "addinfo"}, "description": "➕ Tambah informasi toko baru (hanya di private chat)", "usage": ".addlist <nama>|<isi>", "example": ".addlist Syarat & Ketentuan|1. Pembelian tidak bisa dibatalkan;;2. Garansi 7 hari", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/store/addlist.js", metadata, m, extra)
handler.help = ["umi-store-addlist <nama>|<isi>"]
handler.command = ["umi-store-addlist", "umi-addlist", "umi-addinfo", "addinfo"]
handler.tags = ["store"]
handler.description = "➕ Tambah informasi toko baru (hanya di private chat)"
handler.importSource = "umi"
handler.importConfig = {"name": "addlist", "alias": ["addinfo"], "category": "store", "description": "➕ Tambah informasi toko baru (hanya di private chat)", "usage": ".addlist <nama>|<isi>", "example": ".addlist Syarat & Ketentuan|1. Pembelian tidak bisa dibatalkan;;2. Garansi 7 hari", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": true, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = true
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-store-addlist": "addlist", "umi-addlist": "addlist", "umi-addinfo": "addinfo", "addinfo": "addinfo"}
export default handler
