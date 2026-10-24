import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "ptvsearch", "category": "search", "aliasMap": {"umi-search-ptvsearch": "ptvsearch", "umi-ptvsearch": "ptvsearch", "umi-ptvs": "ptvs", "ptvsearch": "ptvsearch", "ptvs": "ptvs"}, "description": "Cari video TikTok", "usage": ".ptvsearch <query>", "example": ".ptvsearch jj epep", "cooldown": 15, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/search/ptvsearch.js", metadata, m, extra)
handler.help = ["umi-search-ptvsearch <query>"]
handler.command = ["umi-search-ptvsearch", "umi-ptvsearch", "umi-ptvs", "ptvsearch", "ptvs"]
handler.tags = ["search"]
handler.description = "Cari video TikTok"
handler.importSource = "umi"
handler.importConfig = {"name": "ptvsearch", "alias": ["ptvs"], "category": "search", "description": "Cari video TikTok", "usage": ".ptvsearch <query>", "example": ".ptvsearch jj epep", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 15, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-search-ptvsearch": "ptvsearch", "umi-ptvsearch": "ptvsearch", "umi-ptvs": "ptvs", "ptvsearch": "ptvsearch", "ptvs": "ptvs"}
export default handler
