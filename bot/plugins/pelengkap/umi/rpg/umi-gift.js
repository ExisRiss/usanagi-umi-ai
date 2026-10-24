/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "gift", "category": "rpg", "aliasMap": {"umi-rpg-gift": "gift", "umi-gift": "gift", "umi-kasih": "kasih", "umi-hadiah": "hadiah"}, "description": "Beri hadiah ke pasangan untuk meningkatkan love", "usage": ".gift <item> <jumlah>", "example": ".gift diamond 1", "cooldown": 30, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/gift.js", metadata, m, extra)
handler.help = ["umi-rpg-gift <item> <jumlah>"]
handler.command = ["umi-rpg-gift", "umi-gift", "umi-kasih", "umi-hadiah"]
handler.tags = ["rpg"]
handler.description = "Beri hadiah ke pasangan untuk meningkatkan love"
handler.importSource = "umi"
handler.importConfig = {"name": "gift", "alias": ["kasih", "hadiah"], "category": "rpg", "description": "Beri hadiah ke pasangan untuk meningkatkan love", "usage": ".gift <item> <jumlah>", "example": ".gift diamond 1", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 30, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-rpg-gift": "gift", "umi-gift": "gift", "umi-kasih": "kasih", "umi-hadiah": "hadiah"}
export default handler
