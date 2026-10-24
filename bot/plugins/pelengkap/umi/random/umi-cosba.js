import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cosba", "category": "random", "aliasMap": {"umi-random-cosba": "cosba", "umi-cosba": "cosba", "umi-cosplayba": "cosplayba", "cosba": "cosba", "cosplayba": "cosplayba"}, "description": "Random gambar cosplay Blue Archive", "usage": ".cosba", "example": ".cosba", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/random/cosba.js", metadata, m, extra)
handler.help = ["umi-random-cosba"]
handler.command = ["umi-random-cosba", "umi-cosba", "umi-cosplayba", "cosba", "cosplayba"]
handler.tags = ["random"]
handler.description = "Random gambar cosplay Blue Archive"
handler.importSource = "umi"
handler.importConfig = {"name": "cosba", "alias": ["cosplayba", "cosba"], "category": "random", "description": "Random gambar cosplay Blue Archive", "usage": ".cosba", "example": ".cosba", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-random-cosba": "cosba", "umi-cosba": "cosba", "umi-cosplayba": "cosplayba", "cosba": "cosba", "cosplayba": "cosplayba"}
export default handler
