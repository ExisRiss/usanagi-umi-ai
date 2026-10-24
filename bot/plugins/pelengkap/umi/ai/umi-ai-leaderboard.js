import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "ai-leaderboard", "category": "ai", "aliasMap": {"umi-ai-ai-leaderboard": "ai-leaderboard", "umi-ai-leaderboard": "ai-leaderboard", "umi-aileaderboard": "aileaderboard", "umi-aiboard": "aiboard", "umi-ailb": "ailb", "umi-lmarena": "lmarena", "ai-leaderboard": "ai-leaderboard", "aileaderboard": "aileaderboard", "aiboard": "aiboard", "ailb": "ailb", "lmarena": "lmarena"}, "description": "Lihat leaderboard AI model terbaik dari LMArena", "usage": ".ai-leaderboard [category]", "example": ".ai-leaderboard text", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/ai/ai-leaderboard.js", metadata, m, extra)
handler.help = ["umi-ai-ai-leaderboard [category]"]
handler.command = ["umi-ai-ai-leaderboard", "umi-ai-leaderboard", "umi-aileaderboard", "umi-aiboard", "umi-ailb", "umi-lmarena", "ai-leaderboard", "aileaderboard", "aiboard", "ailb", "lmarena"]
handler.tags = ["ai"]
handler.description = "Lihat leaderboard AI model terbaik dari LMArena"
handler.importSource = "umi"
handler.importConfig = {"name": "ai-leaderboard", "alias": ["aileaderboard", "aiboard", "ailb", "lmarena"], "category": "ai", "description": "Lihat leaderboard AI model terbaik dari LMArena", "usage": ".ai-leaderboard [category]", "example": ".ai-leaderboard text", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-ai-ai-leaderboard": "ai-leaderboard", "umi-ai-leaderboard": "ai-leaderboard", "umi-aileaderboard": "aileaderboard", "umi-aiboard": "aiboard", "umi-ailb": "ailb", "umi-lmarena": "lmarena", "ai-leaderboard": "ai-leaderboard", "aileaderboard": "aileaderboard", "aiboard": "aiboard", "ailb": "ailb", "lmarena": "lmarena"}
export default handler
