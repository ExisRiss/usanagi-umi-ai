/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "webpilot", "category": "ai", "aliasMap": {"umi-ai-webpilot": "webpilot", "umi-webpilot": "webpilot", "umi-gpt-oss2b": "gpt-oss2b", "umi-glm47": "glm47", "umi-meta-ai": "meta-ai", "umi-deepseek-pro": "deepseek-pro", "umi-claude-45": "claude-45", "webpilot": "webpilot", "gpt-oss2b": "gpt-oss2b", "glm47": "glm47", "meta-ai": "meta-ai", "deepseek-pro": "deepseek-pro", "claude-45": "claude-45"}, "description": "Model AI tambahan yang dipindahkan dari Aqua", "usage": ".webpilot <pertanyaan>", "example": ".webpilot apa berita terbaru tentang teknologi", "cooldown": 10, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/ai/ai-models.js", metadata, m, extra)
handler.help = ["umi-ai-webpilot <pertanyaan>"]
handler.command = ["umi-ai-webpilot", "umi-webpilot", "umi-gpt-oss2b", "umi-glm47", "umi-meta-ai", "umi-deepseek-pro", "umi-claude-45", "webpilot", "gpt-oss2b", "glm47", "meta-ai", "deepseek-pro", "claude-45"]
handler.tags = ["ai"]
handler.description = "Model AI tambahan yang dipindahkan dari Aqua"
handler.importSource = "umi"
handler.importConfig = {"name": "webpilot", "alias": ["gpt-oss2b", "glm47", "meta-ai", "deepseek-pro", "claude-45"], "category": "ai", "description": "Model AI tambahan yang dipindahkan dari Aqua", "usage": ".webpilot <pertanyaan>", "example": ".webpilot apa berita terbaru tentang teknologi", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-ai-webpilot": "webpilot", "umi-webpilot": "webpilot", "umi-gpt-oss2b": "gpt-oss2b", "umi-glm47": "glm47", "umi-meta-ai": "meta-ai", "umi-deepseek-pro": "deepseek-pro", "umi-claude-45": "claude-45", "webpilot": "webpilot", "gpt-oss2b": "gpt-oss2b", "glm47": "glm47", "meta-ai": "meta-ai", "deepseek-pro": "deepseek-pro", "claude-45": "claude-45"}
export default handler
