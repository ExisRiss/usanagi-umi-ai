/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "fightphonix", "category": "rpg", "aliasMap": {"umi-rpg-fightphonix": "fightphonix", "umi-fightphonix": "fightphonix", "fightphonix": "fightphonix"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/phonix.js", metadata, m, extra)
handler.help = ["umi-rpg-fightphonix"]
handler.command = ["umi-rpg-fightphonix", "umi-fightphonix", "fightphonix"]
handler.tags = ["rpg"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "fightphonix", "alias": [], "category": "rpg", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-rpg-fightphonix": "fightphonix", "umi-fightphonix": "fightphonix", "fightphonix": "fightphonix"}
export default handler
