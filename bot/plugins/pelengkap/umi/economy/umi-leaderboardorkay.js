import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "leaderboard-orang-kaya", "category": "economy", "aliasMap": {"umi-economy-leaderboard-orang-kaya": "leaderboard-orang-kaya", "umi-leaderboard-orang-kaya": "leaderboard-orang-kaya", "umi-topkaya": "topkaya", "umi-orangkaya": "orangkaya", "umi-lbkaya": "lbkaya", "umi-toprich": "toprich", "umi-leaderboardkaya": "leaderboardkaya", "leaderboard-orang-kaya": "leaderboard-orang-kaya", "topkaya": "topkaya", "orangkaya": "orangkaya", "lbkaya": "lbkaya", "toprich": "toprich", "leaderboardkaya": "leaderboardkaya"}, "description": "Ranking orang paling kaya ala Umi dengan dashboard keren 💰🔥", "usage": ".topkaya", "example": ".topkaya", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/economy/leaderboardorkay.js", metadata, m, extra)
handler.help = ["umi-economy-leaderboard-orang-kaya"]
handler.command = ["umi-economy-leaderboard-orang-kaya", "umi-leaderboard-orang-kaya", "umi-topkaya", "umi-orangkaya", "umi-lbkaya", "umi-toprich", "umi-leaderboardkaya", "leaderboard-orang-kaya", "topkaya", "orangkaya", "lbkaya", "toprich", "leaderboardkaya"]
handler.tags = ["economy"]
handler.description = "Ranking orang paling kaya ala Umi dengan dashboard keren 💰🔥"
handler.importSource = "umi"
handler.importConfig = {"name": "leaderboard-orang-kaya", "alias": ["topkaya", "orangkaya", "lbkaya", "toprich", "leaderboardkaya"], "category": "economy", "description": "Ranking orang paling kaya ala Umi dengan dashboard keren 💰🔥", "usage": ".topkaya", "example": ".topkaya", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-economy-leaderboard-orang-kaya": "leaderboard-orang-kaya", "umi-leaderboard-orang-kaya": "leaderboard-orang-kaya", "umi-topkaya": "topkaya", "umi-orangkaya": "orangkaya", "umi-lbkaya": "lbkaya", "umi-toprich": "toprich", "umi-leaderboardkaya": "leaderboardkaya", "leaderboard-orang-kaya": "leaderboard-orang-kaya", "topkaya": "topkaya", "orangkaya": "orangkaya", "lbkaya": "lbkaya", "toprich": "toprich", "leaderboardkaya": "leaderboardkaya"}
export default handler
