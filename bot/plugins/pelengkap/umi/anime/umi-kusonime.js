/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "kusonime", "category": "anime", "aliasMap": {"umi-anime-kusonime": "kusonime", "umi-kusonime": "kusonime", "umi-animeku": "animeku", "umi-nimeku": "nimeku", "umi-animebatch": "animebatch", "kusonime": "kusonime", "animeku": "animeku", "nimeku": "nimeku", "animebatch": "animebatch"}, "description": "Cari anime dari kusonime.com (batch download)", "usage": ".kusonime <search|latest|genre>", "example": ".kusonime search naruto\n.kusonime latest\n.kusonime genre action", "cooldown": 8, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/anime/kusonime.js", metadata, m, extra)
handler.help = ["umi-anime-kusonime <search|latest|genre>"]
handler.command = ["umi-anime-kusonime", "umi-kusonime", "umi-animeku", "umi-nimeku", "umi-animebatch", "kusonime", "animeku", "nimeku", "animebatch"]
handler.tags = ["anime"]
handler.description = "Cari anime dari kusonime.com (batch download)"
handler.importSource = "umi"
handler.importConfig = {"name": "kusonime", "alias": ["animeku", "kusonime", "nimeku", "animebatch"], "category": "anime", "description": "Cari anime dari kusonime.com (batch download)", "usage": ".kusonime <search|latest|genre>", "example": ".kusonime search naruto\n.kusonime latest\n.kusonime genre action", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 8, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-anime-kusonime": "kusonime", "umi-kusonime": "kusonime", "umi-animeku": "animeku", "umi-nimeku": "nimeku", "umi-animebatch": "animebatch", "kusonime": "kusonime", "animeku": "animeku", "nimeku": "nimeku", "animebatch": "animebatch"}
export default handler
