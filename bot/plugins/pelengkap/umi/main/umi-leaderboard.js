/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "leaderboard", "category": "main", "aliasMap": {"umi-main-leaderboard": "leaderboard", "umi-lb": "lb", "umi-ranking": "ranking", "umi-rank": "rank", "umi-topglobal": "topglobal", "umi-topbalance": "topbalance", "umi-topbal": "topbal", "umi-topkoin": "topkoin", "umi-topcoin": "topcoin", "umi-topmoney": "topmoney", "umi-toplimit": "toplimit", "umi-topexp": "topexp", "umi-topxp": "topxp", "umi-toplevel": "toplevel", "umi-topenergi": "topenergi", "umi-topenergy": "topenergy", "ranking": "ranking", "topglobal": "topglobal", "topbalance": "topbalance", "topbal": "topbal", "topkoin": "topkoin", "topcoin": "topcoin", "topmoney": "topmoney", "toplimit": "toplimit", "topexp": "topexp", "topxp": "topxp", "toplevel": "toplevel", "topenergi": "topenergi", "topenergy": "topenergy"}, "description": "Lihat leaderboard global (koin, exp, energi)", "usage": ".leaderboard", "example": ".topkoin", "cooldown": 10, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/main/leaderboard.js", metadata, m, extra)
handler.help = ["umi-main-leaderboard"]
handler.command = ["umi-main-leaderboard", "umi-lb", "umi-ranking", "umi-rank", "umi-topglobal", "umi-topbalance", "umi-topbal", "umi-topkoin", "umi-topcoin", "umi-topmoney", "umi-toplimit", "umi-topexp", "umi-topxp", "umi-toplevel", "umi-topenergi", "umi-topenergy", "ranking", "topglobal", "topbalance", "topbal", "topkoin", "topcoin", "topmoney", "toplimit", "topexp", "topxp", "toplevel", "topenergi", "topenergy"]
handler.tags = ["main"]
handler.description = "Lihat leaderboard global (koin, exp, energi)"
handler.importSource = "umi"
handler.importConfig = {"name": "leaderboard", "alias": ["lb", "top", "leaderboard", "ranking", "rank", "topglobal", "topbalance", "topbal", "topkoin", "topcoin", "topmoney", "toplimit", "topexp", "topxp", "toplevel", "topenergi", "topenergy"], "category": "main", "description": "Lihat leaderboard global (koin, exp, energi)", "usage": ".leaderboard", "example": ".topkoin", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-main-leaderboard": "leaderboard", "umi-lb": "lb", "umi-ranking": "ranking", "umi-rank": "rank", "umi-topglobal": "topglobal", "umi-topbalance": "topbalance", "umi-topbal": "topbal", "umi-topkoin": "topkoin", "umi-topcoin": "topcoin", "umi-topmoney": "topmoney", "umi-toplimit": "toplimit", "umi-topexp": "topexp", "umi-topxp": "topxp", "umi-toplevel": "toplevel", "umi-topenergi": "topenergi", "umi-topenergy": "topenergy", "ranking": "ranking", "topglobal": "topglobal", "topbalance": "topbalance", "topbal": "topbal", "topkoin": "topkoin", "topcoin": "topcoin", "topmoney": "topmoney", "toplimit": "toplimit", "topexp": "topexp", "topxp": "topxp", "toplevel": "toplevel", "topenergi": "topenergi", "topenergy": "topenergy"}
export default handler
