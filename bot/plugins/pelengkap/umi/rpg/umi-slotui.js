/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "slotui", "category": "rpg", "aliasMap": {"umi-rpg-slotui": "slotui", "umi-slotui": "slotui", "umi-slotgame": "slotgame", "umi-fruitbonanza": "fruitbonanza", "slotui": "slotui", "slotgame": "slotgame", "fruitbonanza": "fruitbonanza"}, "description": "Fruit Bonanza slot machine dengan UI HTML interaktif.", "usage": ".slotui", "example": ".slotui", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/slotui.js", metadata, m, extra)
handler.help = ["umi-rpg-slotui"]
handler.command = ["umi-rpg-slotui", "umi-slotui", "umi-slotgame", "umi-fruitbonanza", "slotui", "slotgame", "fruitbonanza"]
handler.tags = ["rpg"]
handler.description = "Fruit Bonanza slot machine dengan UI HTML interaktif."
handler.importSource = "umi"
handler.importConfig = {"name": "slotui", "alias": ["slotgame", "fruitbonanza"], "category": "rpg", "description": "Fruit Bonanza slot machine dengan UI HTML interaktif.", "usage": ".slotui", "example": ".slotui", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-rpg-slotui": "slotui", "umi-slotui": "slotui", "umi-slotgame": "slotgame", "umi-fruitbonanza": "fruitbonanza", "slotui": "slotui", "slotgame": "slotgame", "fruitbonanza": "fruitbonanza"}
export default handler
