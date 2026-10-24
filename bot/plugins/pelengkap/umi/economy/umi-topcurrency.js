/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "topcurrency", "category": "economy", "aliasMap": {"umi-economy-topcurrency": "topcurrency", "umi-topcurrency": "topcurrency", "umi-topmatauang": "topmatauang", "umi-rankcurrency": "rankcurrency", "topcurrency": "topcurrency", "topmatauang": "topmatauang", "rankcurrency": "rankcurrency"}, "description": "Lihat leaderboard per mata uang", "usage": ".topcurrency <matauang>", "example": ".topcurrency idr", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/economy/topcurrency.js", metadata, m, extra)
handler.help = ["umi-economy-topcurrency <matauang>"]
handler.command = ["umi-economy-topcurrency", "umi-topcurrency", "umi-topmatauang", "umi-rankcurrency", "topcurrency", "topmatauang", "rankcurrency"]
handler.tags = ["economy"]
handler.description = "Lihat leaderboard per mata uang"
handler.importSource = "umi"
handler.importConfig = {"name": "topcurrency", "alias": ["topmatauang", "rankcurrency"], "category": "economy", "description": "Lihat leaderboard per mata uang", "usage": ".topcurrency <matauang>", "example": ".topcurrency idr", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-economy-topcurrency": "topcurrency", "umi-topcurrency": "topcurrency", "umi-topmatauang": "topmatauang", "umi-rankcurrency": "rankcurrency", "topcurrency": "topcurrency", "topmatauang": "topmatauang", "rankcurrency": "rankcurrency"}
export default handler
