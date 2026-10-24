/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "setrules", "category": "owner", "aliasMap": {"umi-owner-setrules": "setrules", "umi-setrules": "setrules", "umi-setbotrules": "setbotrules", "umi-setaturanbot": "setaturanbot", "setrules": "setrules", "setbotrules": "setbotrules", "setaturanbot": "setaturanbot"}, "description": "Set rules/aturan bot custom", "usage": ".setrules <text>", "example": ".setrules 1. Jangan spam\n2. Hormati sesama", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/setrules.js", metadata, m, extra)
handler.help = ["umi-owner-setrules <text>"]
handler.command = ["umi-owner-setrules", "umi-setrules", "umi-setbotrules", "umi-setaturanbot", "setrules", "setbotrules", "setaturanbot"]
handler.tags = ["owner"]
handler.description = "Set rules/aturan bot custom"
handler.importSource = "umi"
handler.importConfig = {"name": "setrules", "alias": ["setbotrules", "setaturanbot"], "category": "owner", "description": "Set rules/aturan bot custom", "usage": ".setrules <text>", "example": ".setrules 1. Jangan spam\n2. Hormati sesama", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-setrules": "setrules", "umi-setrules": "setrules", "umi-setbotrules": "setbotrules", "umi-setaturanbot": "setaturanbot", "setrules": "setrules", "setbotrules": "setbotrules", "setaturanbot": "setaturanbot"}
export default handler
