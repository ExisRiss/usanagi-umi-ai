/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "fakechannel", "category": "maker", "aliasMap": {"umi-maker-fakechannel": "fakechannel", "umi-fakechannel": "fakechannel", "umi-fakech": "fakech", "fakechannel": "fakechannel"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/maker/fakech.js", metadata, m, extra)
handler.help = ["umi-maker-fakechannel"]
handler.command = ["umi-maker-fakechannel", "umi-fakechannel", "umi-fakech", "fakechannel"]
handler.tags = ["maker"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "fakechannel", "alias": ["fakech"], "category": "maker", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-maker-fakechannel": "fakechannel", "umi-fakechannel": "fakechannel", "umi-fakech": "fakech", "fakechannel": "fakechannel"}
export default handler
