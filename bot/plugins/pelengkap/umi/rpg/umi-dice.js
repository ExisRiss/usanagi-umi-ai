/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "dice", "category": "rpg", "aliasMap": {"umi-rpg-dice": "dice", "umi-dice": "dice", "umi-dadu": "dadu", "umi-roll": "roll"}, "description": "Lempar dadu untuk gambling", "usage": ".dice <1-6> <bet>", "example": ".dice 6 5000", "cooldown": 15, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/dice.js", metadata, m, extra)
handler.help = ["umi-rpg-dice <1-6> <bet>"]
handler.command = ["umi-rpg-dice", "umi-dice", "umi-dadu", "umi-roll"]
handler.tags = ["rpg"]
handler.description = "Lempar dadu untuk gambling"
handler.importSource = "umi"
handler.importConfig = {"name": "dice", "alias": ["dadu", "roll"], "category": "rpg", "description": "Lempar dadu untuk gambling", "usage": ".dice <1-6> <bet>", "example": ".dice 6 5000", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 15, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-rpg-dice": "dice", "umi-dice": "dice", "umi-dadu": "dadu", "umi-roll": "roll"}
export default handler
