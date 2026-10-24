import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "hotline", "category": "maker", "aliasMap": {"umi-maker-hotline": "hotline", "umi-hotline": "hotline", "hotline": "hotline"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/maker/hotline.js", metadata, m, extra)
handler.help = ["umi-maker-hotline"]
handler.command = ["umi-maker-hotline", "umi-hotline", "hotline"]
handler.tags = ["maker"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "hotline", "alias": [], "category": "maker", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-maker-hotline": "hotline", "umi-hotline": "hotline", "hotline": "hotline"}
export default handler
