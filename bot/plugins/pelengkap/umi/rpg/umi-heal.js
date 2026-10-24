/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "heal", "category": "rpg", "aliasMap": {"umi-rpg-heal": "heal", "umi-heal": "heal", "umi-sembuh": "sembuh", "umi-recover": "recover"}, "description": "Pulihkan health dengan istirahat (gratis tapi lama)", "usage": ".heal", "example": ".heal", "cooldown": 600, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/heal.js", metadata, m, extra)
handler.help = ["umi-rpg-heal"]
handler.command = ["umi-rpg-heal", "umi-heal", "umi-sembuh", "umi-recover"]
handler.tags = ["rpg"]
handler.description = "Pulihkan health dengan istirahat (gratis tapi lama)"
handler.importSource = "umi"
handler.importConfig = {"name": "heal", "alias": ["sembuh", "recover"], "category": "rpg", "description": "Pulihkan health dengan istirahat (gratis tapi lama)", "usage": ".heal", "example": ".heal", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 600, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-rpg-heal": "heal", "umi-heal": "heal", "umi-sembuh": "sembuh", "umi-recover": "recover"}
export default handler
