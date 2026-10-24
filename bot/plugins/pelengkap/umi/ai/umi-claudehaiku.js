/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "claudehaiku", "category": "ai", "aliasMap": {"umi-ai-claudehaiku": "claudehaiku", "umi-claudehaiku": "claudehaiku", "umi-claude": "claude", "umi-haiku": "haiku", "umi-chiku": "chiku", "claudehaiku": "claudehaiku", "claude": "claude", "haiku": "haiku", "chiku": "chiku"}, "description": "Chat dengan Claude Haiku 4.5 via OverChat", "usage": ".claudehaiku <pertanyaan>", "example": ".claudehaiku Jelaskan teori relativitas", "cooldown": 10, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/ai/claudehaiku.js", metadata, m, extra)
handler.help = ["umi-ai-claudehaiku <pertanyaan>"]
handler.command = ["umi-ai-claudehaiku", "umi-claudehaiku", "umi-claude", "umi-haiku", "umi-chiku", "claudehaiku", "claude", "haiku", "chiku"]
handler.tags = ["ai"]
handler.description = "Chat dengan Claude Haiku 4.5 via OverChat"
handler.importSource = "umi"
handler.importConfig = {"name": "claudehaiku", "alias": ["claude", "haiku", "chiku"], "category": "ai", "description": "Chat dengan Claude Haiku 4.5 via OverChat", "usage": ".claudehaiku <pertanyaan>", "example": ".claudehaiku Jelaskan teori relativitas", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-ai-claudehaiku": "claudehaiku", "umi-claudehaiku": "claudehaiku", "umi-claude": "claude", "umi-haiku": "haiku", "umi-chiku": "chiku", "claudehaiku": "claudehaiku", "claude": "claude", "haiku": "haiku", "chiku": "chiku"}
export default handler
