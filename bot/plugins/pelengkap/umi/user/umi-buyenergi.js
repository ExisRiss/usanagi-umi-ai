import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "buyenergi", "category": "user", "aliasMap": {"umi-user-buyenergi": "buyenergi", "umi-buyenergi": "buyenergi", "umi-belienergi": "belienergi", "umi-purchaseenergi": "purchaseenergi", "umi-buyenergy": "buyenergy", "buyenergi": "buyenergi", "belienergi": "belienergi", "purchaseenergi": "purchaseenergi", "buyenergy": "buyenergy"}, "description": "Beli energi dengan koin (1 energi = 100 koin)", "usage": ".buyenergi <jumlah>", "example": ".buyenergi 10", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/user/buyenergi.js", metadata, m, extra)
handler.help = ["umi-user-buyenergi <jumlah>"]
handler.command = ["umi-user-buyenergi", "umi-buyenergi", "umi-belienergi", "umi-purchaseenergi", "umi-buyenergy", "buyenergi", "belienergi", "purchaseenergi", "buyenergy"]
handler.tags = ["user"]
handler.description = "Beli energi dengan koin (1 energi = 100 koin)"
handler.importSource = "umi"
handler.importConfig = {"name": "buyenergi", "alias": ["belienergi", "purchaseenergi", "buyenergy"], "category": "user", "description": "Beli energi dengan koin (1 energi = 100 koin)", "usage": ".buyenergi <jumlah>", "example": ".buyenergi 10", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-user-buyenergi": "buyenergi", "umi-buyenergi": "buyenergi", "umi-belienergi": "belienergi", "umi-purchaseenergi": "purchaseenergi", "umi-buyenergy": "buyenergy", "buyenergi": "buyenergi", "belienergi": "belienergi", "purchaseenergi": "purchaseenergi", "buyenergy": "buyenergy"}
export default handler
