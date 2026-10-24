/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "mistral", "category": "ai", "aliasMap": {"umi-ai-mistral": "mistral", "umi-mistral": "mistral", "umi-mistralai": "mistralai", "umi-chatmistral": "chatmistral", "mistral": "mistral", "mistralai": "mistralai", "chatmistral": "chatmistral"}, "description": "AI Chat using Mistral AI", "usage": ".mistral <pesan>", "example": ".mistral Halo, apa kabar?", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/ai/mistralai.js", metadata, m, extra)
handler.help = ["umi-ai-mistral <pesan>"]
handler.command = ["umi-ai-mistral", "umi-mistral", "umi-mistralai", "umi-chatmistral", "mistral", "mistralai", "chatmistral"]
handler.tags = ["ai"]
handler.description = "AI Chat using Mistral AI"
handler.importSource = "umi"
handler.importConfig = {"name": "mistral", "alias": ["mistralai", "chatmistral"], "category": "ai", "description": "AI Chat using Mistral AI", "usage": ".mistral <pesan>", "example": ".mistral Halo, apa kabar?", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-ai-mistral": "mistral", "umi-mistral": "mistral", "umi-mistralai": "mistralai", "umi-chatmistral": "chatmistral", "mistral": "mistral", "mistralai": "mistralai", "chatmistral": "chatmistral"}
export default handler
