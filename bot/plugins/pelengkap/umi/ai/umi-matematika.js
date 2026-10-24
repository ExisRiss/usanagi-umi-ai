import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "matematika", "category": "ai", "aliasMap": {"umi-ai-matematika": "matematika", "umi-matematika": "matematika", "umi-mathgpt": "mathgpt", "umi-math": "math", "umi-mathsolver": "mathsolver", "matematika": "matematika", "mathgpt": "mathgpt", "math": "math", "mathsolver": "mathsolver"}, "description": "AI untuk menyelesaikan soal matematika", "usage": ".matematika <soal>", "example": ".matematika 2+2 berapa?", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/ai/matematika.js", metadata, m, extra)
handler.help = ["umi-ai-matematika <soal>"]
handler.command = ["umi-ai-matematika", "umi-matematika", "umi-mathgpt", "umi-math", "umi-mathsolver", "matematika", "mathgpt", "math", "mathsolver"]
handler.tags = ["ai"]
handler.description = "AI untuk menyelesaikan soal matematika"
handler.importSource = "umi"
handler.importConfig = {"name": "matematika", "alias": ["mathgpt", "math", "mathsolver"], "category": "ai", "description": "AI untuk menyelesaikan soal matematika", "usage": ".matematika <soal>", "example": ".matematika 2+2 berapa?", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-ai-matematika": "matematika", "umi-matematika": "matematika", "umi-mathgpt": "mathgpt", "umi-math": "math", "umi-mathsolver": "mathsolver", "matematika": "matematika", "mathgpt": "mathgpt", "math": "math", "mathsolver": "mathsolver"}
export default handler
