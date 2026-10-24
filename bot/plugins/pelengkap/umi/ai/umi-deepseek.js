/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "deepseek", "category": "ai", "aliasMap": {"umi-ai-deepseek": "deepseek", "umi-deepseek": "deepseek", "umi-ds": "ds", "umi-dsv4": "dsv4", "umi-deepthink": "deepthink", "ds": "ds", "dsv4": "dsv4", "deepthink": "deepthink"}, "description": "Chat dengan DeepSeek V4 (thinking/reasoning)", "usage": ".deepseek <pertanyaan>", "example": ".deepseek Jelaskan black hole", "cooldown": 10, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/ai/deepseek.js", metadata, m, extra)
handler.help = ["umi-ai-deepseek <pertanyaan>"]
handler.command = ["umi-ai-deepseek", "umi-deepseek", "umi-ds", "umi-dsv4", "umi-deepthink", "ds", "dsv4", "deepthink"]
handler.tags = ["ai"]
handler.description = "Chat dengan DeepSeek V4 (thinking/reasoning)"
handler.importSource = "umi"
handler.importConfig = {"name": "deepseek", "alias": ["ds", "dsv4", "deepthink"], "category": "ai", "description": "Chat dengan DeepSeek V4 (thinking/reasoning)", "usage": ".deepseek <pertanyaan>", "example": ".deepseek Jelaskan black hole", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-ai-deepseek": "deepseek", "umi-deepseek": "deepseek", "umi-ds": "ds", "umi-dsv4": "dsv4", "umi-deepthink": "deepthink", "ds": "ds", "dsv4": "dsv4", "deepthink": "deepthink"}
export default handler
