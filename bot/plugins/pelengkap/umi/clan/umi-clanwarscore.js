import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "clanwarscore", "category": "clan", "aliasMap": {"umi-clan-clanwarscore": "clanwarscore", "umi-clanwarscore": "clanwarscore", "umi-warscores": "warscores", "umi-scorewar": "scorewar", "umi-skorwar": "skorwar", "clanwarscore": "clanwarscore", "warscores": "warscores", "scorewar": "scorewar", "skorwar": "skorwar"}, "description": "Lihat skor clan war", "usage": ".clanwarscore", "example": ".clanwarscore", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/clan/clanwarscore.js", metadata, m, extra)
handler.help = ["umi-clan-clanwarscore"]
handler.command = ["umi-clan-clanwarscore", "umi-clanwarscore", "umi-warscores", "umi-scorewar", "umi-skorwar", "clanwarscore", "warscores", "scorewar", "skorwar"]
handler.tags = ["clan"]
handler.description = "Lihat skor clan war"
handler.importSource = "umi"
handler.importConfig = {"name": "clanwarscore", "alias": ["warscores", "scorewar", "skorwar"], "category": "clan", "description": "Lihat skor clan war", "usage": ".clanwarscore", "example": ".clanwarscore", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-clan-clanwarscore": "clanwarscore", "umi-clanwarscore": "clanwarscore", "umi-warscores": "warscores", "umi-scorewar": "scorewar", "umi-skorwar": "skorwar", "clanwarscore": "clanwarscore", "warscores": "warscores", "scorewar": "scorewar", "skorwar": "skorwar"}
export default handler
