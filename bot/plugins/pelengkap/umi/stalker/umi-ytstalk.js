/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "ytstalk", "category": "stalker", "aliasMap": {"umi-stalker-ytstalk": "ytstalk", "umi-ytstalk": "ytstalk", "umi-youtubestalk": "youtubestalk", "umi-stalkyt": "stalkyt", "ytstalk": "ytstalk", "youtubestalk": "youtubestalk", "stalkyt": "stalkyt"}, "description": "Stalk channel YouTube", "usage": ".ytstalk <username>", "example": ".ytstalk mrbeast", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/stalker/ytstalk.js", metadata, m, extra)
handler.help = ["umi-stalker-ytstalk <username>"]
handler.command = ["umi-stalker-ytstalk", "umi-ytstalk", "umi-youtubestalk", "umi-stalkyt", "ytstalk", "youtubestalk", "stalkyt"]
handler.tags = ["stalker"]
handler.description = "Stalk channel YouTube"
handler.importSource = "umi"
handler.importConfig = {"name": "ytstalk", "alias": ["youtubestalk", "stalkyt"], "category": "stalker", "description": "Stalk channel YouTube", "usage": ".ytstalk <username>", "example": ".ytstalk mrbeast", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-stalker-ytstalk": "ytstalk", "umi-ytstalk": "ytstalk", "umi-youtubestalk": "youtubestalk", "umi-stalkyt": "stalkyt", "ytstalk": "ytstalk", "youtubestalk": "youtubestalk", "stalkyt": "stalkyt"}
export default handler
