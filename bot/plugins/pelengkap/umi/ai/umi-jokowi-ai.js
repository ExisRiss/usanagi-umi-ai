import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "jokowi-ai", "category": "ai", "aliasMap": {"umi-ai-jokowi-ai": "jokowi-ai", "umi-jokowi-ai": "jokowi-ai", "umi-jokowiai": "jokowiai", "umi-jokowi": "jokowi", "umi-pakjokowi": "pakjokowi", "jokowi-ai": "jokowi-ai", "jokowiai": "jokowiai", "jokowi": "jokowi", "pakjokowi": "pakjokowi"}, "description": "Chat dengan Pak Jokowi — Pria Solo", "usage": ".jokowi-ai <pertanyaan>", "example": ".jokowi-ai Pak, gimana kabar?", "cooldown": 10, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/ai/jokowi-ai.js", metadata, m, extra)
handler.help = ["umi-ai-jokowi-ai <pertanyaan>"]
handler.command = ["umi-ai-jokowi-ai", "umi-jokowi-ai", "umi-jokowiai", "umi-jokowi", "umi-pakjokowi", "jokowi-ai", "jokowiai", "jokowi", "pakjokowi"]
handler.tags = ["ai"]
handler.description = "Chat dengan Pak Jokowi — Pria Solo"
handler.importSource = "umi"
handler.importConfig = {"name": "jokowi-ai", "alias": ["jokowiai", "jokowi", "pakjokowi"], "category": "ai", "description": "Chat dengan Pak Jokowi — Pria Solo", "usage": ".jokowi-ai <pertanyaan>", "example": ".jokowi-ai Pak, gimana kabar?", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-ai-jokowi-ai": "jokowi-ai", "umi-jokowi-ai": "jokowi-ai", "umi-jokowiai": "jokowiai", "umi-jokowi": "jokowi", "umi-pakjokowi": "pakjokowi", "jokowi-ai": "jokowi-ai", "jokowiai": "jokowiai", "jokowi": "jokowi", "pakjokowi": "pakjokowi"}
export default handler
