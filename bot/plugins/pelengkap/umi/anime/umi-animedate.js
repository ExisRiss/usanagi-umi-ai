/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "animedate", "category": "anime", "aliasMap": {"umi-anime-animedate": "animedate", "umi-animedate": "animedate", "umi-animerilis": "animerilis", "umi-animekalender": "animekalender", "umi-animerelease": "animerelease", "animedate": "animedate", "animerilis": "animerilis", "animekalender": "animekalender", "animerelease": "animerelease"}, "description": "Kalender rilis anime musim ini (Spring/Summer/Fall/Winter)", "usage": ".animedate [season]", "example": ".animedate\n.animedate spring\n.animedate summer\n.animedate fall\n.animedate winter", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/anime/animedate.js", metadata, m, extra)
handler.help = ["umi-anime-animedate [season]"]
handler.command = ["umi-anime-animedate", "umi-animedate", "umi-animerilis", "umi-animekalender", "umi-animerelease", "animedate", "animerilis", "animekalender", "animerelease"]
handler.tags = ["anime"]
handler.description = "Kalender rilis anime musim ini (Spring/Summer/Fall/Winter)"
handler.importSource = "umi"
handler.importConfig = {"name": "animedate", "alias": ["animerilis", "animekalender", "animerelease"], "category": "anime", "description": "Kalender rilis anime musim ini (Spring/Summer/Fall/Winter)", "usage": ".animedate [season]", "example": ".animedate\n.animedate spring\n.animedate summer\n.animedate fall\n.animedate winter", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-anime-animedate": "animedate", "umi-animedate": "animedate", "umi-animerilis": "animerilis", "umi-animekalender": "animekalender", "umi-animerelease": "animerelease", "animedate": "animedate", "animerilis": "animerilis", "animekalender": "animekalender", "animerelease": "animerelease"}
export default handler
