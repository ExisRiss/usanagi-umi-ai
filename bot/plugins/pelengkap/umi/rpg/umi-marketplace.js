import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "7eleven", "category": "rpg", "aliasMap": {"umi-rpg-7eleven": "7eleven", "umi-7eleven": "7eleven", "umi-foodshop": "foodshop", "umi-marketstall": "marketstall", "umi-buyfood": "buyfood", "7eleven": "7eleven", "foodshop": "foodshop", "marketstall": "marketstall", "buyfood": "buyfood"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/marketplace.js", metadata, m, extra)
handler.help = ["umi-rpg-7eleven"]
handler.command = ["umi-rpg-7eleven", "umi-7eleven", "umi-foodshop", "umi-marketstall", "umi-buyfood", "7eleven", "foodshop", "marketstall", "buyfood"]
handler.tags = ["rpg"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "7eleven", "alias": ["foodshop", "marketstall", "buyfood"], "category": "rpg", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-rpg-7eleven": "7eleven", "umi-7eleven": "7eleven", "umi-foodshop": "foodshop", "umi-marketstall": "marketstall", "umi-buyfood": "buyfood", "7eleven": "7eleven", "foodshop": "foodshop", "marketstall": "marketstall", "buyfood": "buyfood"}
export default handler
