/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "numbgen", "category": "tools", "aliasMap": {"umi-tools-numbgen": "numbgen", "umi-numbgen": "numbgen", "numbgen": "numbgen"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/numbgen.js", metadata, m, extra)
handler.help = ["umi-tools-numbgen"]
handler.command = ["umi-tools-numbgen", "umi-numbgen", "numbgen"]
handler.tags = ["tools"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "numbgen", "alias": [], "category": "tools", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": true, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = true
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-tools-numbgen": "numbgen", "umi-numbgen": "numbgen", "numbgen": "numbgen"}
export default handler
