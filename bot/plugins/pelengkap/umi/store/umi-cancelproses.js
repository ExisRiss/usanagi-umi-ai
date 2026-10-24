import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cancelproses", "category": "store", "aliasMap": {"umi-store-cancelproses": "cancelproses", "umi-cancelproses": "cancelproses", "umi-batalproses": "batalproses", "umi-canceltrx": "canceltrx", "cancelproses": "cancelproses", "batalproses": "batalproses", "canceltrx": "canceltrx"}, "description": "Batalkan proses transaksi", "usage": ".cancelproses @buyer", "example": ".cancelproses @628xxx", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/store/cancelproses.js", metadata, m, extra)
handler.help = ["umi-store-cancelproses @buyer"]
handler.command = ["umi-store-cancelproses", "umi-cancelproses", "umi-batalproses", "umi-canceltrx", "cancelproses", "batalproses", "canceltrx"]
handler.tags = ["store"]
handler.description = "Batalkan proses transaksi"
handler.importSource = "umi"
handler.importConfig = {"name": "cancelproses", "alias": ["batalproses", "canceltrx"], "category": "store", "description": "Batalkan proses transaksi", "usage": ".cancelproses @buyer", "example": ".cancelproses @628xxx", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-store-cancelproses": "cancelproses", "umi-cancelproses": "cancelproses", "umi-batalproses": "batalproses", "umi-canceltrx": "canceltrx", "cancelproses": "cancelproses", "batalproses": "batalproses", "canceltrx": "canceltrx"}
export default handler
