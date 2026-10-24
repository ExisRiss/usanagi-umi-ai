/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "meguminai", "category": "ai", "aliasMap": {"umi-ai-meguminai": "meguminai", "umi-meguminai": "meguminai", "umi-megu": "megu", "meguminai": "meguminai", "megu": "megu"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/ai/megumin.js", metadata, m, extra)
handler.help = ["umi-ai-meguminai"]
handler.command = ["umi-ai-meguminai", "umi-meguminai", "umi-megu", "meguminai", "megu"]
handler.tags = ["ai"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "meguminai", "alias": ["megu"], "category": "ai", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-ai-meguminai": "meguminai", "umi-meguminai": "meguminai", "umi-megu": "megu", "meguminai": "meguminai", "megu": "megu"}
export default handler
