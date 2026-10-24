/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "sellall", "category": "rpg", "aliasMap": {"umi-rpg-sellall": "sellall", "umi-sellall": "sellall", "umi-jualsemua": "jualsemua", "umi-quicksell": "quicksell"}, "description": "Jual semua item yang bisa dijual sekaligus", "usage": ".sellall", "example": ".sellall", "cooldown": 30, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/sellall.js", metadata, m, extra)
handler.help = ["umi-rpg-sellall"]
handler.command = ["umi-rpg-sellall", "umi-sellall", "umi-jualsemua", "umi-quicksell"]
handler.tags = ["rpg"]
handler.description = "Jual semua item yang bisa dijual sekaligus"
handler.importSource = "umi"
handler.importConfig = {"name": "sellall", "alias": ["jualsemua", "quicksell"], "category": "rpg", "description": "Jual semua item yang bisa dijual sekaligus", "usage": ".sellall", "example": ".sellall", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 30, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-rpg-sellall": "sellall", "umi-sellall": "sellall", "umi-jualsemua": "jualsemua", "umi-quicksell": "quicksell"}
export default handler
