/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "lahelu", "category": "random", "aliasMap": {"umi-random-lahelu": "lahelu", "umi-lahelu": "lahelu", "umi-randommeme": "randommeme", "lahelu": "lahelu", "randommeme": "randommeme"}, "description": "Random gambar lahelu", "usage": ".lahelu", "example": ".lahelu", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/random/lahelu.js", metadata, m, extra)
handler.help = ["umi-random-lahelu"]
handler.command = ["umi-random-lahelu", "umi-lahelu", "umi-randommeme", "lahelu", "randommeme"]
handler.tags = ["random"]
handler.description = "Random gambar lahelu"
handler.importSource = "umi"
handler.importConfig = {"name": "lahelu", "alias": ["randommeme"], "category": "random", "description": "Random gambar lahelu", "usage": ".lahelu", "example": ".lahelu", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-random-lahelu": "lahelu", "umi-lahelu": "lahelu", "umi-randommeme": "randommeme", "lahelu": "lahelu", "randommeme": "randommeme"}
export default handler
