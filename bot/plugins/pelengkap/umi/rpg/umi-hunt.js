/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "hunt", "category": "rpg", "aliasMap": {"umi-rpg-hunt": "hunt", "umi-hunt": "hunt", "umi-hunting": "hunting", "hunting": "hunting"}, "description": "Berburu hewan untuk mendapatkan daging dan kulit", "usage": ".hunt", "example": ".hunt", "cooldown": 90, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/hunt.js", metadata, m, extra)
handler.help = ["umi-rpg-hunt"]
handler.command = ["umi-rpg-hunt", "umi-hunt", "umi-hunting", "hunting"]
handler.tags = ["rpg"]
handler.description = "Berburu hewan untuk mendapatkan daging dan kulit"
handler.importSource = "umi"
handler.importConfig = {"name": "hunt", "alias": ["berburu", "hunting"], "category": "rpg", "description": "Berburu hewan untuk mendapatkan daging dan kulit", "usage": ".hunt", "example": ".hunt", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 90, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-rpg-hunt": "hunt", "umi-hunt": "hunt", "umi-hunting": "hunting", "hunting": "hunting"}
export default handler
