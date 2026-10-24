/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "infotourney", "category": "info", "aliasMap": {"umi-info-infotourney": "infotourney", "umi-infotourney": "infotourney", "umi-tourney": "tourney", "umi-turnamen": "turnamen", "umi-mltourney": "mltourney", "infotourney": "infotourney", "tourney": "tourney", "turnamen": "turnamen", "mltourney": "mltourney"}, "description": "Info turnamen Mobile Legends terbaru", "usage": ".infotourney", "example": ".infotourney", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/info/infotourney.js", metadata, m, extra)
handler.help = ["umi-info-infotourney"]
handler.command = ["umi-info-infotourney", "umi-infotourney", "umi-tourney", "umi-turnamen", "umi-mltourney", "infotourney", "tourney", "turnamen", "mltourney"]
handler.tags = ["info"]
handler.description = "Info turnamen Mobile Legends terbaru"
handler.importSource = "umi"
handler.importConfig = {"name": "infotourney", "alias": ["tourney", "turnamen", "mltourney"], "category": "info", "description": "Info turnamen Mobile Legends terbaru", "usage": ".infotourney", "example": ".infotourney", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-info-infotourney": "infotourney", "umi-infotourney": "infotourney", "umi-tourney": "tourney", "umi-turnamen": "turnamen", "umi-mltourney": "mltourney", "infotourney": "infotourney", "tourney": "tourney", "turnamen": "turnamen", "mltourney": "mltourney"}
export default handler
