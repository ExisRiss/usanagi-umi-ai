import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "setproses", "category": "store", "aliasMap": {"umi-store-setproses": "setproses", "umi-setproses": "setproses", "umi-prosesconfig": "prosesconfig", "umi-configproses": "configproses", "setproses": "setproses", "prosesconfig": "prosesconfig", "configproses": "configproses"}, "description": "Set template untuk .proses", "usage": ".setproses template <full text>", "example": ".setproses template 「 *TRANSAKSI DIPROSES* 」\\n\\n👤 Buyer: @{buyer_number}", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/store/setproses.js", metadata, m, extra)
handler.help = ["umi-store-setproses template <full text>"]
handler.command = ["umi-store-setproses", "umi-setproses", "umi-prosesconfig", "umi-configproses", "setproses", "prosesconfig", "configproses"]
handler.tags = ["store"]
handler.description = "Set template untuk .proses"
handler.importSource = "umi"
handler.importConfig = {"name": "setproses", "alias": ["prosesconfig", "configproses"], "category": "store", "description": "Set template untuk .proses", "usage": ".setproses template <full text>", "example": ".setproses template 「 *TRANSAKSI DIPROSES* 」\\n\\n👤 Buyer: @{buyer_number}", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-store-setproses": "setproses", "umi-setproses": "setproses", "umi-prosesconfig": "prosesconfig", "umi-configproses": "configproses", "setproses": "setproses", "prosesconfig": "prosesconfig", "configproses": "configproses"}
export default handler
