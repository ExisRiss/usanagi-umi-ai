/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "mikutalk", "category": "tools", "aliasMap": {"umi-tools-mikutalk": "mikutalk", "umi-mikutalk": "mikutalk", "mikutalk": "mikutalk"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/mikutalk.js", metadata, m, extra)
handler.help = ["umi-tools-mikutalk"]
handler.command = ["umi-tools-mikutalk", "umi-mikutalk", "mikutalk"]
handler.tags = ["tools"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "mikutalk", "alias": [], "category": "tools", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-tools-mikutalk": "mikutalk", "umi-mikutalk": "mikutalk", "mikutalk": "mikutalk"}
export default handler
