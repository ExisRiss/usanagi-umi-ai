import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "waguri-ai", "category": "ai", "aliasMap": {"umi-ai-waguri-ai": "waguri-ai", "umi-waguri-ai": "waguri-ai", "umi-waguriai": "waguriai", "umi-waguri": "waguri", "waguri-ai": "waguri-ai", "waguriai": "waguriai", "waguri": "waguri"}, "description": "Chat dengan Waguri-san — Gadis pemalu yang lupa kacamata", "usage": ".waguri-ai <pertanyaan>", "example": ".waguri-ai Waguri-san, halo!", "cooldown": 10, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/ai/waguri-ai.js", metadata, m, extra)
handler.help = ["umi-ai-waguri-ai <pertanyaan>"]
handler.command = ["umi-ai-waguri-ai", "umi-waguri-ai", "umi-waguriai", "umi-waguri", "waguri-ai", "waguriai", "waguri"]
handler.tags = ["ai"]
handler.description = "Chat dengan Waguri-san — Gadis pemalu yang lupa kacamata"
handler.importSource = "umi"
handler.importConfig = {"name": "waguri-ai", "alias": ["waguriai", "waguri"], "category": "ai", "description": "Chat dengan Waguri-san — Gadis pemalu yang lupa kacamata", "usage": ".waguri-ai <pertanyaan>", "example": ".waguri-ai Waguri-san, halo!", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-ai-waguri-ai": "waguri-ai", "umi-waguri-ai": "waguri-ai", "umi-waguriai": "waguriai", "umi-waguri": "waguri", "waguri-ai": "waguri-ai", "waguriai": "waguriai", "waguri": "waguri"}
export default handler
