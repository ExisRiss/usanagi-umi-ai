/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "nijika", "category": "ai", "aliasMap": {"umi-ai-nijika": "nijika", "umi-nijika": "nijika", "umi-nijikaai": "nijikaai", "nijika": "nijika", "nijikaai": "nijikaai"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/ai/nijika.js", metadata, m, extra)
handler.help = ["umi-ai-nijika"]
handler.command = ["umi-ai-nijika", "umi-nijika", "umi-nijikaai", "nijika", "nijikaai"]
handler.tags = ["ai"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "nijika", "alias": ["nijikaai"], "category": "ai", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-ai-nijika": "nijika", "umi-nijika": "nijika", "umi-nijikaai": "nijikaai", "nijika": "nijika", "nijikaai": "nijikaai"}
export default handler
