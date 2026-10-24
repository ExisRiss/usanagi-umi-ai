/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "slot2", "category": "game", "aliasMap": {"umi-game-slot2": "slot2", "umi-slot2": "slot2", "umi-slots2": "slots2", "umi-mesin2": "mesin2", "umi-mesinslot2": "mesinslot2", "slots2": "slots2", "mesin2": "mesin2", "mesinslot2": "mesinslot2"}, "description": "Inline Fruit Bonanza slot game", "usage": ".slot2", "example": ".slot2", "cooldown": 1, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/game/slot2.js", metadata, m, extra)
handler.help = ["umi-game-slot2"]
handler.command = ["umi-game-slot2", "umi-slot2", "umi-slots2", "umi-mesin2", "umi-mesinslot2", "slots2", "mesin2", "mesinslot2"]
handler.tags = ["game"]
handler.description = "Inline Fruit Bonanza slot game"
handler.importSource = "umi"
handler.importConfig = {"name": "slot2", "alias": ["slots2", "mesin2", "mesinslot2"], "category": "game", "description": "Inline Fruit Bonanza slot game", "usage": ".slot2", "example": ".slot2", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 1, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-game-slot2": "slot2", "umi-slot2": "slot2", "umi-slots2": "slots2", "umi-mesin2": "mesin2", "umi-mesinslot2": "mesinslot2", "slots2": "slots2", "mesin2": "mesin2", "mesinslot2": "mesinslot2"}
export default handler
