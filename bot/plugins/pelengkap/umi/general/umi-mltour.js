import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "mltour", "category": "general", "aliasMap": {"umi-general-mltour": "mltour", "umi-mltour": "mltour", "mltour": "mltour"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/general/mltour.js", metadata, m, extra)
handler.help = ["umi-general-mltour"]
handler.command = ["umi-general-mltour", "umi-mltour", "mltour"]
handler.tags = ["general"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "mltour", "alias": [], "category": "general", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-general-mltour": "mltour", "umi-mltour": "mltour", "mltour": "mltour"}
export default handler
