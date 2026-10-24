import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "mahiru", "category": "ai", "aliasMap": {"umi-ai-mahiru": "mahiru", "umi-mahiru": "mahiru", "mahiru": "mahiru"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/ai/mahiru.js", metadata, m, extra)
handler.help = ["umi-ai-mahiru"]
handler.command = ["umi-ai-mahiru", "umi-mahiru", "mahiru"]
handler.tags = ["ai"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "mahiru", "alias": [], "category": "ai", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-ai-mahiru": "mahiru", "umi-mahiru": "mahiru", "mahiru": "mahiru"}
export default handler
