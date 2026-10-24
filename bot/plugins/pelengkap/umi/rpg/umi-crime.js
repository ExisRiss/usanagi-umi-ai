import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "crime", "category": "rpg", "aliasMap": {"umi-rpg-crime": "crime", "umi-crime": "crime", "umi-curi": "curi", "curi": "curi"}, "description": "Melakukan kejahatan membobol ATM (risiko tinggi)", "usage": ".crime", "example": ".crime", "cooldown": 300, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/crime.js", metadata, m, extra)
handler.help = ["umi-rpg-crime"]
handler.command = ["umi-rpg-crime", "umi-crime", "umi-curi", "curi"]
handler.tags = ["rpg"]
handler.description = "Melakukan kejahatan membobol ATM (risiko tinggi)"
handler.importSource = "umi"
handler.importConfig = {"name": "crime", "alias": ["curi", "jahat"], "category": "rpg", "description": "Melakukan kejahatan membobol ATM (risiko tinggi)", "usage": ".crime", "example": ".crime", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 300, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-rpg-crime": "crime", "umi-crime": "crime", "umi-curi": "curi", "curi": "curi"}
export default handler
