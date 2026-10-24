/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "hutao", "category": "ai", "aliasMap": {"umi-ai-hutao": "hutao", "umi-hutao": "hutao", "umi-hutaoai": "hutaoai", "hutao": "hutao", "hutaoai": "hutaoai"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/ai/hutao.js", metadata, m, extra)
handler.help = ["umi-ai-hutao"]
handler.command = ["umi-ai-hutao", "umi-hutao", "umi-hutaoai", "hutao", "hutaoai"]
handler.tags = ["ai"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "hutao", "alias": ["hutaoai"], "category": "ai", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-ai-hutao": "hutao", "umi-hutao": "hutao", "umi-hutaoai": "hutaoai", "hutao": "hutao", "hutaoai": "hutaoai"}
export default handler
