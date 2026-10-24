import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "tgram", "category": "general", "aliasMap": {"umi-general-tgram": "tgram", "umi-tgram": "tgram", "tgram": "tgram"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/general/telegramch.js", metadata, m, extra)
handler.help = ["umi-general-tgram"]
handler.command = ["umi-general-tgram", "umi-tgram", "tgram"]
handler.tags = ["general"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "tgram", "alias": [], "category": "general", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-general-tgram": "tgram", "umi-tgram": "tgram", "tgram": "tgram"}
export default handler
