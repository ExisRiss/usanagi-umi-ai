import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "luffyai", "category": "ai", "aliasMap": {"umi-ai-luffyai": "luffyai", "umi-luffyai": "luffyai", "umi-luffy": "luffy", "umi-monkeydluffy": "monkeydluffy", "umi-mugiwara": "mugiwara", "luffyai": "luffyai", "luffy": "luffy", "monkeydluffy": "monkeydluffy", "mugiwara": "mugiwara"}, "description": "Chat dengan Monkey D. Luffy — Calon Raja Bajak Laut dari Topi Jerami! 🏴‍☠️", "usage": ".luffyai <pertanyaan>", "example": ".luffyai Halo Luffy!", "cooldown": 10, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/ai/luffy_ai.js", metadata, m, extra)
handler.help = ["umi-ai-luffyai <pertanyaan>"]
handler.command = ["umi-ai-luffyai", "umi-luffyai", "umi-luffy", "umi-monkeydluffy", "umi-mugiwara", "luffyai", "luffy", "monkeydluffy", "mugiwara"]
handler.tags = ["ai"]
handler.description = "Chat dengan Monkey D. Luffy — Calon Raja Bajak Laut dari Topi Jerami! 🏴‍☠️"
handler.importSource = "umi"
handler.importConfig = {"name": "luffyai", "alias": ["luffy", "monkeydluffy", "mugiwara"], "category": "ai", "description": "Chat dengan Monkey D. Luffy — Calon Raja Bajak Laut dari Topi Jerami! 🏴‍☠️", "usage": ".luffyai <pertanyaan>", "example": ".luffyai Halo Luffy!", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-ai-luffyai": "luffyai", "umi-luffyai": "luffyai", "umi-luffy": "luffy", "umi-monkeydluffy": "monkeydluffy", "umi-mugiwara": "mugiwara", "luffyai": "luffyai", "luffy": "luffy", "monkeydluffy": "monkeydluffy", "mugiwara": "mugiwara"}
export default handler
