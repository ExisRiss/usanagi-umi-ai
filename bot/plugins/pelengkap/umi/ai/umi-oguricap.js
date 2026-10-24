import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "oguri", "category": "ai", "aliasMap": {"umi-ai-oguri": "oguri", "umi-oguri": "oguri", "umi-oguricap": "oguricap", "oguri": "oguri", "oguricap": "oguricap"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/ai/oguricap.js", metadata, m, extra)
handler.help = ["umi-ai-oguri"]
handler.command = ["umi-ai-oguri", "umi-oguri", "umi-oguricap", "oguri", "oguricap"]
handler.tags = ["ai"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "oguri", "alias": ["oguricap"], "category": "ai", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-ai-oguri": "oguri", "umi-oguri": "oguri", "umi-oguricap": "oguricap", "oguri": "oguri", "oguricap": "oguricap"}
export default handler
