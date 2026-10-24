/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "igstalk", "category": "stalker", "aliasMap": {"umi-stalker-igstalk": "igstalk", "umi-igstalk": "igstalk", "umi-instagramstalk": "instagramstalk", "umi-stalking": "stalking", "igstalk": "igstalk", "instagramstalk": "instagramstalk", "stalking": "stalking"}, "description": "Stalk akun Instagram", "usage": ".igstalk <username>", "example": ".igstalk cristiano", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/stalker/igstalk.js", metadata, m, extra)
handler.help = ["umi-stalker-igstalk <username>"]
handler.command = ["umi-stalker-igstalk", "umi-igstalk", "umi-instagramstalk", "umi-stalking", "igstalk", "instagramstalk", "stalking"]
handler.tags = ["stalker"]
handler.description = "Stalk akun Instagram"
handler.importSource = "umi"
handler.importConfig = {"name": "igstalk", "alias": ["instagramstalk", "stalking"], "category": "stalker", "description": "Stalk akun Instagram", "usage": ".igstalk <username>", "example": ".igstalk cristiano", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-stalker-igstalk": "igstalk", "umi-igstalk": "igstalk", "umi-instagramstalk": "instagramstalk", "umi-stalking": "stalking", "igstalk": "igstalk", "instagramstalk": "instagramstalk", "stalking": "stalking"}
export default handler
