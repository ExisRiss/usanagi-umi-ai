/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "qwen3", "category": "ai", "aliasMap": {"umi-ai-qwen3": "qwen3", "umi-qwen3": "qwen3", "umi-qwen": "qwen", "umi-qw3": "qw3", "qwen3": "qwen3", "qwen": "qwen", "qw3": "qw3"}, "description": "Chat dengan Qwen3 80B via OverChat", "usage": ".qwen3 <pertanyaan>", "example": ".qwen3 Apa itu machine learning?", "cooldown": 10, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/ai/qwen3.js", metadata, m, extra)
handler.help = ["umi-ai-qwen3 <pertanyaan>"]
handler.command = ["umi-ai-qwen3", "umi-qwen3", "umi-qwen", "umi-qw3", "qwen3", "qwen", "qw3"]
handler.tags = ["ai"]
handler.description = "Chat dengan Qwen3 80B via OverChat"
handler.importSource = "umi"
handler.importConfig = {"name": "qwen3", "alias": ["qwen", "qw3"], "category": "ai", "description": "Chat dengan Qwen3 80B via OverChat", "usage": ".qwen3 <pertanyaan>", "example": ".qwen3 Apa itu machine learning?", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-ai-qwen3": "qwen3", "umi-qwen3": "qwen3", "umi-qwen": "qwen", "umi-qw3": "qw3", "qwen3": "qwen3", "qwen": "qwen", "qw3": "qw3"}
export default handler
