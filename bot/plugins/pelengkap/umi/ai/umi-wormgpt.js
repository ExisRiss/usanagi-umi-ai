import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "wormgpt", "category": "ai", "aliasMap": {"umi-ai-wormgpt": "wormgpt", "umi-wormgpt": "wormgpt", "umi-worm": "worm", "wormgpt": "wormgpt", "worm": "worm"}, "description": "Chat dengan WormGPT (uncensored AI)", "usage": ".wormgpt <pertanyaan>", "example": ".wormgpt perkenalkan dirimu", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/ai/wormgpt.js", metadata, m, extra)
handler.help = ["umi-ai-wormgpt <pertanyaan>"]
handler.command = ["umi-ai-wormgpt", "umi-wormgpt", "umi-worm", "wormgpt", "worm"]
handler.tags = ["ai"]
handler.description = "Chat dengan WormGPT (uncensored AI)"
handler.importSource = "umi"
handler.importConfig = {"name": "wormgpt", "alias": ["worm"], "category": "ai", "description": "Chat dengan WormGPT (uncensored AI)", "usage": ".wormgpt <pertanyaan>", "example": ".wormgpt perkenalkan dirimu", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-ai-wormgpt": "wormgpt", "umi-wormgpt": "wormgpt", "umi-worm": "worm", "wormgpt": "wormgpt", "worm": "worm"}
export default handler
