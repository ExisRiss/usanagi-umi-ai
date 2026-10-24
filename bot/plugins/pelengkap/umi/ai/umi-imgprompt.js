import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "imgprompt", "category": "ai", "aliasMap": {"umi-ai-imgprompt": "imgprompt", "umi-imgprompt": "imgprompt"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/ai/imgprompt.js", metadata, m, extra)
handler.help = ["umi-ai-imgprompt"]
handler.command = ["umi-ai-imgprompt", "umi-imgprompt"]
handler.tags = ["ai"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "imgprompt", "alias": [], "category": "ai", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-ai-imgprompt": "imgprompt", "umi-imgprompt": "imgprompt"}
export default handler
