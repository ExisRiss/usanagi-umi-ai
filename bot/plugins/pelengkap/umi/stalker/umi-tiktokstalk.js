/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "tiktokstalk", "category": "stalker", "aliasMap": {"umi-stalker-tiktokstalk": "tiktokstalk", "umi-tiktokstalk": "tiktokstalk", "umi-ttstalk": "ttstalk", "umi-stalktt": "stalktt", "tiktokstalk": "tiktokstalk", "stalktt": "stalktt"}, "description": "Stalk akun TikTok", "usage": ".tiktokstalk <username>", "example": ".tiktokstalk mrbeast", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/stalker/tiktokstalk.js", metadata, m, extra)
handler.help = ["umi-stalker-tiktokstalk <username>"]
handler.command = ["umi-stalker-tiktokstalk", "umi-tiktokstalk", "umi-ttstalk", "umi-stalktt", "tiktokstalk", "stalktt"]
handler.tags = ["stalker"]
handler.description = "Stalk akun TikTok"
handler.importSource = "umi"
handler.importConfig = {"name": "tiktokstalk", "alias": ["ttstalk", "stalktt"], "category": "stalker", "description": "Stalk akun TikTok", "usage": ".tiktokstalk <username>", "example": ".tiktokstalk mrbeast", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-stalker-tiktokstalk": "tiktokstalk", "umi-tiktokstalk": "tiktokstalk", "umi-ttstalk": "ttstalk", "umi-stalktt": "stalktt", "tiktokstalk": "tiktokstalk", "stalktt": "stalktt"}
export default handler
