/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "slot", "category": "rpg", "aliasMap": {"umi-rpg-slot": "slot", "umi-slot": "slot", "umi-slots": "slots", "umi-mesin": "mesin"}, "description": "Main slot machine gambling", "usage": ".slot <bet>", "example": ".slot 5000", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/slot.js", metadata, m, extra)
handler.help = ["umi-rpg-slot <bet>"]
handler.command = ["umi-rpg-slot", "umi-slot", "umi-slots", "umi-mesin"]
handler.tags = ["rpg"]
handler.description = "Main slot machine gambling"
handler.importSource = "umi"
handler.importConfig = {"name": "slot", "alias": ["slots", "mesin"], "category": "rpg", "description": "Main slot machine gambling", "usage": ".slot <bet>", "example": ".slot 5000", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-rpg-slot": "slot", "umi-slot": "slot", "umi-slots": "slots", "umi-mesin": "mesin"}
export default handler
