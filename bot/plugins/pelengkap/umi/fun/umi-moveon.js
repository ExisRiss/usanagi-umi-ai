import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "moveon", "category": "fun", "aliasMap": {"umi-fun-moveon": "moveon", "umi-moveon": "moveon", "moveon": "moveon"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/fun/moveon.js", metadata, m, extra)
handler.help = ["umi-fun-moveon"]
handler.command = ["umi-fun-moveon", "umi-moveon", "moveon"]
handler.tags = ["fun"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "moveon", "alias": [], "category": "fun", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-fun-moveon": "moveon", "umi-moveon": "moveon", "moveon": "moveon"}
export default handler
