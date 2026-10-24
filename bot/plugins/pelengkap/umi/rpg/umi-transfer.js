/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "transfer", "category": "rpg", "aliasMap": {"umi-rpg-transfer": "transfer", "umi-transfer": "transfer", "umi-tf": "tf", "umi-pay": "pay"}, "description": "Transfer uang atau item ke user lain", "usage": ".transfer <money/nama_item> <jumlah> @user", "example": ".transfer money 10000 @tag", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/transfer.js", metadata, m, extra)
handler.help = ["umi-rpg-transfer <money/nama_item> <jumlah> @user"]
handler.command = ["umi-rpg-transfer", "umi-transfer", "umi-tf", "umi-pay"]
handler.tags = ["rpg"]
handler.description = "Transfer uang atau item ke user lain"
handler.importSource = "umi"
handler.importConfig = {"name": "transfer", "alias": ["tf", "kirim", "pay"], "category": "rpg", "description": "Transfer uang atau item ke user lain", "usage": ".transfer <money/nama_item> <jumlah> @user", "example": ".transfer money 10000 @tag", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-rpg-transfer": "transfer", "umi-transfer": "transfer", "umi-tf": "tf", "umi-pay": "pay"}
export default handler
