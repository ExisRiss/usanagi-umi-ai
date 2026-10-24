/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "gpt5", "category": "ai", "aliasMap": {"umi-ai-gpt5": "gpt5", "umi-gpt5": "gpt5", "umi-gpt5nano": "gpt5nano", "umi-gpt41": "gpt41", "gpt5": "gpt5", "gpt5nano": "gpt5nano", "gpt41": "gpt41"}, "description": "Chat dengan GPT-4.1 Nano via OverChat", "usage": ".gpt5 <pertanyaan>", "example": ".gpt5 Apa itu quantum computing?", "cooldown": 10, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/ai/gpt5.js", metadata, m, extra)
handler.help = ["umi-ai-gpt5 <pertanyaan>"]
handler.command = ["umi-ai-gpt5", "umi-gpt5", "umi-gpt5nano", "umi-gpt41", "gpt5", "gpt5nano", "gpt41"]
handler.tags = ["ai"]
handler.description = "Chat dengan GPT-4.1 Nano via OverChat"
handler.importSource = "umi"
handler.importConfig = {"name": "gpt5", "alias": ["gpt5nano", "gpt41"], "category": "ai", "description": "Chat dengan GPT-4.1 Nano via OverChat", "usage": ".gpt5 <pertanyaan>", "example": ".gpt5 Apa itu quantum computing?", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-ai-gpt5": "gpt5", "umi-gpt5": "gpt5", "umi-gpt5nano": "gpt5nano", "umi-gpt41": "gpt41", "gpt5": "gpt5", "gpt5nano": "gpt5nano", "gpt41": "gpt41"}
export default handler
