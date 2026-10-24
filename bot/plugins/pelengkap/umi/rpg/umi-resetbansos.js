/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "resetbansos", "category": "rpg", "aliasMap": {"umi-rpg-resetbansos": "resetbansos", "umi-resetbansos": "resetbansos", "resetbansos": "resetbansos"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/resetbansos.js", metadata, m, extra)
handler.help = ["umi-rpg-resetbansos"]
handler.command = ["umi-rpg-resetbansos", "umi-resetbansos", "resetbansos"]
handler.tags = ["rpg"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "resetbansos", "alias": [], "category": "rpg", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-rpg-resetbansos": "resetbansos", "umi-resetbansos": "resetbansos", "resetbansos": "resetbansos"}
export default handler
