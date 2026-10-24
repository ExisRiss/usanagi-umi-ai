/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "textlogo", "category": "maker", "aliasMap": {"umi-maker-textlogo": "textlogo", "umi-textlogo": "textlogo", "textlogo": "textlogo"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/maker/textlogo.js", metadata, m, extra)
handler.help = ["umi-maker-textlogo"]
handler.command = ["umi-maker-textlogo", "umi-textlogo", "textlogo"]
handler.tags = ["maker"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "textlogo", "alias": [], "category": "maker", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-maker-textlogo": "textlogo", "umi-textlogo": "textlogo", "textlogo": "textlogo"}
export default handler
