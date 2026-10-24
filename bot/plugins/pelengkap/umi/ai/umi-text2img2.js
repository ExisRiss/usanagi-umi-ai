/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "text2img2", "category": "ai", "aliasMap": {"umi-ai-text2img2": "text2img2", "umi-text2img2": "text2img2", "umi-genimg": "genimg", "text2img2": "text2img2", "t2i2": "t2i2", "genimg": "genimg"}, "description": "Generate image from text using AI", "usage": ".text2img2 <prompt>", "example": ".text2img2 a futuristic city in mars", "cooldown": 10, "energi": 5}
const handler = (m, extra) => runImportedFeature("umi", "plugins/ai/text2img2.js", metadata, m, extra)
handler.help = ["umi-ai-text2img2 <prompt>"]
handler.command = ["umi-ai-text2img2", "umi-text2img2", "umi-genimg", "text2img2", "t2i2", "genimg"]
handler.tags = ["ai"]
handler.description = "Generate image from text using AI"
handler.importSource = "umi"
handler.importConfig = {"name": "text2img2", "alias": ["t2i2", "genimg"], "category": "ai", "description": "Generate image from text using AI", "usage": ".text2img2 <prompt>", "example": ".text2img2 a futuristic city in mars", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 5, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-ai-text2img2": "text2img2", "umi-text2img2": "text2img2", "umi-genimg": "genimg", "text2img2": "text2img2", "t2i2": "t2i2", "genimg": "genimg"}
export default handler
