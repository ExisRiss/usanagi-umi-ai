import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "lapor", "category": "info", "aliasMap": {"umi-info-lapor": "lapor", "umi-lapor": "lapor", "umi-report": "report", "lapor": "lapor", "report": "report"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/info/lapor.js", metadata, m, extra)
handler.help = ["umi-info-lapor"]
handler.command = ["umi-info-lapor", "umi-lapor", "umi-report", "lapor", "report"]
handler.tags = ["info"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "lapor", "alias": ["report"], "category": "info", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-info-lapor": "lapor", "umi-lapor": "lapor", "umi-report": "report", "lapor": "lapor", "report": "report"}
export default handler
