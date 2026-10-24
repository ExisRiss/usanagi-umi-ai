import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "umi-ai", "category": "ai", "aliasMap": {"umi-ai": "umi-ai", "umi-ai": "umi-ai", "umiai": "umiai", "umi": "umi", "umi-ai": "ai", "umiai": "umiai", "umi": "umi"}, "description": "Chat dengan Umi AI — Asisten bot cerdas", "usage": ".umi-ai <pertanyaan>", "example": ".umi-ai Apa itu Node.js?", "cooldown": 10, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/ai/rimuru-ai.js", metadata, m, extra)
handler.help = ["umi-ai <pertanyaan>"]
handler.command = ["umi-ai", "umiai", "umi"]
handler.tags = ["ai"]
handler.description = "Chat dengan Umi AI — Asisten bot cerdas"
handler.importSource = "umi"
handler.importConfig = {"name": "umi-ai", "alias": ["umiai", "umi"], "category": "ai", "description": "Chat dengan Umi AI — Asisten bot cerdas", "usage": ".umi-ai <pertanyaan>", "example": ".umi-ai Apa itu Node.js?", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-ai": "umi-ai", "umi-ai": "umi-ai", "umiai": "umiai", "umi": "umi", "umi-ai": "ai", "umiai": "umiai", "umi": "umi"}
export default handler
