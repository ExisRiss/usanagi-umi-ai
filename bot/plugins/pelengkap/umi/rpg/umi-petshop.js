import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "petshop", "category": "rpg", "aliasMap": {"umi-rpg-petshop": "petshop", "umi-petshop": "petshop", "umi-tokopet": "tokopet", "umi-buypet": "buypet", "umi-belipet": "belipet"}, "description": "Beli pet dari toko", "usage": ".petshop <buy> <pet>", "example": ".petshop buy cat", "cooldown": 10, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/petshop.js", metadata, m, extra)
handler.help = ["umi-rpg-petshop <buy> <pet>"]
handler.command = ["umi-rpg-petshop", "umi-petshop", "umi-tokopet", "umi-buypet", "umi-belipet"]
handler.tags = ["rpg"]
handler.description = "Beli pet dari toko"
handler.importSource = "umi"
handler.importConfig = {"name": "petshop", "alias": ["tokopet", "buypet", "belipet"], "category": "rpg", "description": "Beli pet dari toko", "usage": ".petshop <buy> <pet>", "example": ".petshop buy cat", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-rpg-petshop": "petshop", "umi-petshop": "petshop", "umi-tokopet": "tokopet", "umi-buypet": "buypet", "umi-belipet": "belipet"}
export default handler
