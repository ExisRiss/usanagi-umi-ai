import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "hoshino", "category": "ai", "aliasMap": {"umi-ai-hoshino": "hoshino", "umi-hoshino": "hoshino", "umi-hoshinoba": "hoshinoba", "hoshino": "hoshino", "hoshinoba": "hoshinoba"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/ai/hoshino.js", metadata, m, extra)
handler.help = ["umi-ai-hoshino"]
handler.command = ["umi-ai-hoshino", "umi-hoshino", "umi-hoshinoba", "hoshino", "hoshinoba"]
handler.tags = ["ai"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "hoshino", "alias": ["hoshinoba"], "category": "ai", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-ai-hoshino": "hoshino", "umi-hoshino": "hoshino", "umi-hoshinoba": "hoshinoba", "hoshino": "hoshino", "hoshinoba": "hoshinoba"}
export default handler
