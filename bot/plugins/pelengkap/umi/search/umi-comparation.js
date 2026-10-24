/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "advance-comparation", "category": "search", "aliasMap": {"umi-search-advance-comparation": "advance-comparation", "umi-advance-comparation": "advance-comparation", "umi-bandingkan-device": "bandingkan-device", "umi-compare": "compare", "advance-comparation": "advance-comparation", "bandingkan-device": "bandingkan-device", "compare": "compare"}, "description": "Bandingkan dua perangkat (smartphone, tablet, laptop, dll)", "usage": ".bandingkan-device [type] <query>", "example": ".bandingkan-device phone samsung s24", "cooldown": 5, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/search/comparation.js", metadata, m, extra)
handler.help = ["umi-search-advance-comparation [type] <query>"]
handler.command = ["umi-search-advance-comparation", "umi-advance-comparation", "umi-bandingkan-device", "umi-compare", "advance-comparation", "bandingkan-device", "compare"]
handler.tags = ["search"]
handler.description = "Bandingkan dua perangkat (smartphone, tablet, laptop, dll)"
handler.importSource = "umi"
handler.importConfig = {"name": "advance-comparation", "alias": ["bandingkan-device", "compare"], "category": "search", "description": "Bandingkan dua perangkat (smartphone, tablet, laptop, dll)", "usage": ".bandingkan-device [type] <query>", "example": ".bandingkan-device phone samsung s24", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-search-advance-comparation": "advance-comparation", "umi-advance-comparation": "advance-comparation", "umi-bandingkan-device": "bandingkan-device", "umi-compare": "compare", "advance-comparation": "advance-comparation", "bandingkan-device": "bandingkan-device", "compare": "compare"}
export default handler
