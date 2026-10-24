/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "up-pb", "category": "tools", "aliasMap": {"umi-tools-up-pb": "up-pb", "umi-up-pb": "up-pb", "umi-uppastebin": "uppastebin", "up-pb": "up-pb", "uppastebin": "uppastebin"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/uppastebin.js", metadata, m, extra)
handler.help = ["umi-tools-up-pb"]
handler.command = ["umi-tools-up-pb", "umi-up-pb", "umi-uppastebin", "up-pb", "uppastebin"]
handler.tags = ["tools"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "up-pb", "alias": ["uppastebin"], "category": "tools", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-tools-up-pb": "up-pb", "umi-up-pb": "up-pb", "umi-uppastebin": "uppastebin", "up-pb": "up-pb", "uppastebin": "uppastebin"}
export default handler
