import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "furina", "category": "ai", "aliasMap": {"umi-ai-furina": "furina", "umi-furina": "furina", "furina": "furina"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/ai/furina.js", metadata, m, extra)
handler.help = ["umi-ai-furina"]
handler.command = ["umi-ai-furina", "umi-furina", "furina"]
handler.tags = ["ai"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "furina", "alias": [], "category": "ai", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-ai-furina": "furina", "umi-furina": "furina", "furina": "furina"}
export default handler
