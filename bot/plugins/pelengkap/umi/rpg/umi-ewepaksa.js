/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "ewepaksa", "category": "rpg", "aliasMap": {"umi-rpg-ewepaksa": "ewepaksa", "umi-ewepaksa": "ewepaksa", "umi-perkosa": "perkosa", "ewepaksa": "ewepaksa", "perkosa": "perkosa"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/ewepaksa.js", metadata, m, extra)
handler.help = ["umi-rpg-ewepaksa"]
handler.command = ["umi-rpg-ewepaksa", "umi-ewepaksa", "umi-perkosa", "ewepaksa", "perkosa"]
handler.tags = ["rpg"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "ewepaksa", "alias": ["perkosa"], "category": "rpg", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": true, "isGroup": true, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = true
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-rpg-ewepaksa": "ewepaksa", "umi-ewepaksa": "ewepaksa", "umi-perkosa": "perkosa", "ewepaksa": "ewepaksa", "perkosa": "perkosa"}
export default handler
