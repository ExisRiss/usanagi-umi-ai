/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "expedition", "category": "rpg", "aliasMap": {"umi-rpg-expedition": "expedition", "umi-expedition": "expedition", "umi-ekspedisi": "ekspedisi", "exp": "exp"}, "description": "Kirim ekspedisi otomatis untuk item", "usage": ".expedition <start/claim/status>", "example": ".expedition start forest", "cooldown": 10, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/expedition.js", metadata, m, extra)
handler.help = ["umi-rpg-expedition <start/claim/status>"]
handler.command = ["umi-rpg-expedition", "umi-expedition", "umi-ekspedisi", "exp"]
handler.tags = ["rpg"]
handler.description = "Kirim ekspedisi otomatis untuk item"
handler.importSource = "umi"
handler.importConfig = {"name": "expedition", "alias": ["ekspedisi", "exp", "explore"], "category": "rpg", "description": "Kirim ekspedisi otomatis untuk item", "usage": ".expedition <start/claim/status>", "example": ".expedition start forest", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-rpg-expedition": "expedition", "umi-expedition": "expedition", "umi-ekspedisi": "ekspedisi", "exp": "exp"}
export default handler
