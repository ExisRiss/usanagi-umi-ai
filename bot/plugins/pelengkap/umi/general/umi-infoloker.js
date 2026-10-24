import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "infoloker", "category": "general", "aliasMap": {"umi-general-infoloker": "infoloker", "umi-infoloker": "infoloker", "infoloker": "infoloker"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/general/infoloker.js", metadata, m, extra)
handler.help = ["umi-general-infoloker"]
handler.command = ["umi-general-infoloker", "umi-infoloker", "infoloker"]
handler.tags = ["general"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "infoloker", "alias": [], "category": "general", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-general-infoloker": "infoloker", "umi-infoloker": "infoloker", "infoloker": "infoloker"}
export default handler
