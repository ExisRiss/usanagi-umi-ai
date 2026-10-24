import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "ffstalk", "category": "stalker", "aliasMap": {"umi-stalker-ffstalk": "ffstalk", "umi-ffstalk": "ffstalk", "umi-freefireid": "freefireid", "umi-stalkff": "stalkff", "umi-ff": "ff", "ffstalk": "ffstalk", "freefireid": "freefireid", "stalkff": "stalkff", "ff": "ff"}, "description": "Melihat informasi lengkap akun Free Fire berdasarkan ID.", "usage": ".ffstalk <id>", "example": ".ffstalk 470699855", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/stalker/ffstalk.js", metadata, m, extra)
handler.help = ["umi-stalker-ffstalk <id>"]
handler.command = ["umi-stalker-ffstalk", "umi-ffstalk", "umi-freefireid", "umi-stalkff", "umi-ff", "ffstalk", "freefireid", "stalkff", "ff"]
handler.tags = ["stalker"]
handler.description = "Melihat informasi lengkap akun Free Fire berdasarkan ID."
handler.importSource = "umi"
handler.importConfig = {"name": "ffstalk", "alias": ["freefireid", "stalkff", "ff"], "category": "stalker", "description": "Melihat informasi lengkap akun Free Fire berdasarkan ID.", "usage": ".ffstalk <id>", "example": ".ffstalk 470699855", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-stalker-ffstalk": "ffstalk", "umi-ffstalk": "ffstalk", "umi-freefireid": "freefireid", "umi-stalkff": "stalkff", "umi-ff": "ff", "ffstalk": "ffstalk", "freefireid": "freefireid", "stalkff": "stalkff", "ff": "ff"}
export default handler
