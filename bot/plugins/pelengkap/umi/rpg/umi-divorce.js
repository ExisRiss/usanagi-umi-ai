/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "divorce", "category": "rpg", "aliasMap": {"umi-rpg-divorce": "divorce", "umi-divorce": "divorce", "umi-pisah": "pisah"}, "description": "Bercerai dari pasangan", "usage": ".divorce", "example": ".divorce", "cooldown": 60, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/divorce.js", metadata, m, extra)
handler.help = ["umi-rpg-divorce"]
handler.command = ["umi-rpg-divorce", "umi-divorce", "umi-pisah"]
handler.tags = ["rpg"]
handler.description = "Bercerai dari pasangan"
handler.importSource = "umi"
handler.importConfig = {"name": "divorce", "alias": ["cerai", "pisah"], "category": "rpg", "description": "Bercerai dari pasangan", "usage": ".divorce", "example": ".divorce", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 60, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-rpg-divorce": "divorce", "umi-divorce": "divorce", "umi-pisah": "pisah"}
export default handler
