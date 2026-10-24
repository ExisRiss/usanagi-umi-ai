import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "sora2", "category": "ai", "aliasMap": {"umi-ai-sora2": "sora2", "umi-sora2": "sora2", "umi-sora": "sora", "sora2": "sora2", "sora": "sora"}, "description": "Ubah gambar menjadi video (Sora 2)", "usage": ".sora <prompt>", "example": ".sora anime cinematic", "cooldown": 20, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/ai/sora2.js", metadata, m, extra)
handler.help = ["umi-ai-sora2 <prompt>"]
handler.command = ["umi-ai-sora2", "umi-sora2", "umi-sora", "sora2", "sora"]
handler.tags = ["ai"]
handler.description = "Ubah gambar menjadi video (Sora 2)"
handler.importSource = "umi"
handler.importConfig = {"name": "sora2", "alias": ["sora"], "category": "ai", "description": "Ubah gambar menjadi video (Sora 2)", "usage": ".sora <prompt>", "example": ".sora anime cinematic", "cooldown": 20, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-ai-sora2": "sora2", "umi-sora2": "sora2", "umi-sora": "sora", "sora2": "sora2", "sora": "sora"}
export default handler
