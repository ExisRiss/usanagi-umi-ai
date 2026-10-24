import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "shop", "category": "rpg", "aliasMap": {"umi-rpg-shop": "shop", "umi-shop": "shop", "umi-jual": "jual", "umi-store": "store", "umi-sell": "sell"}, "description": "Beli dan jual item RPG", "usage": ".shop <buy/sell> <item> <jumlah>", "example": ".shop buy potion 1", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/shop.js", metadata, m, extra)
handler.help = ["umi-rpg-shop <buy/sell> <item> <jumlah>"]
handler.command = ["umi-rpg-shop", "umi-shop", "umi-jual", "umi-store", "umi-sell"]
handler.tags = ["rpg"]
handler.description = "Beli dan jual item RPG"
handler.importSource = "umi"
handler.importConfig = {"name": "shop", "alias": ["beli", "jual", "toko", "store", "buy", "sell"], "category": "rpg", "description": "Beli dan jual item RPG", "usage": ".shop <buy/sell> <item> <jumlah>", "example": ".shop buy potion 1", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-rpg-shop": "shop", "umi-shop": "shop", "umi-jual": "jual", "umi-store": "store", "umi-sell": "sell"}
export default handler
