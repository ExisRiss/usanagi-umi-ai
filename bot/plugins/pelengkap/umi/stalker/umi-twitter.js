import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "twitterstalk", "category": "stalker", "aliasMap": {"umi-stalker-twitterstalk": "twitterstalk", "umi-twitterstalk": "twitterstalk", "umi-twstalk": "twstalk", "twitterstalk": "twitterstalk", "twstalk": "twstalk"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/stalker/twitter.js", metadata, m, extra)
handler.help = ["umi-stalker-twitterstalk"]
handler.command = ["umi-stalker-twitterstalk", "umi-twitterstalk", "umi-twstalk", "twitterstalk", "twstalk"]
handler.tags = ["stalker"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "twitterstalk", "alias": ["twstalk"], "category": "stalker", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-stalker-twitterstalk": "twitterstalk", "umi-twitterstalk": "twitterstalk", "umi-twstalk": "twstalk", "twitterstalk": "twitterstalk", "twstalk": "twstalk"}
export default handler
