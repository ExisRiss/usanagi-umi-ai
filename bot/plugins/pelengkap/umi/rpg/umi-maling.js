/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "maling", "category": "rpg", "aliasMap": {"umi-rpg-maling": "maling", "umi-maling": "maling", "umi-copet": "copet", "umi-pickpocket": "pickpocket", "pickpocket": "pickpocket"}, "description": "Mencopet orang di pasar (lebih berisiko dari crime)", "usage": ".maling", "example": ".maling", "cooldown": 180, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/maling.js", metadata, m, extra)
handler.help = ["umi-rpg-maling"]
handler.command = ["umi-rpg-maling", "umi-maling", "umi-copet", "umi-pickpocket", "pickpocket"]
handler.tags = ["rpg"]
handler.description = "Mencopet orang di pasar (lebih berisiko dari crime)"
handler.importSource = "umi"
handler.importConfig = {"name": "maling", "alias": ["copet", "pickpocket"], "category": "rpg", "description": "Mencopet orang di pasar (lebih berisiko dari crime)", "usage": ".maling", "example": ".maling", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 180, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-rpg-maling": "maling", "umi-maling": "maling", "umi-copet": "copet", "umi-pickpocket": "pickpocket", "pickpocket": "pickpocket"}
export default handler
