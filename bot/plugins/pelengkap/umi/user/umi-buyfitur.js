/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "buyfitur", "category": "user", "aliasMap": {"umi-user-buyfitur": "buyfitur", "umi-buyfitur": "buyfitur", "umi-belifitur": "belifitur", "umi-purchasefeature": "purchasefeature", "umi-buyfeature": "buyfeature", "buyfitur": "buyfitur", "belifitur": "belifitur", "purchasefeature": "purchasefeature", "buyfeature": "buyfeature"}, "description": "Beli fitur premium (1 fitur = 3000 koin)", "usage": ".buyfitur [nama_fitur]", "example": ".buyfitur", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/user/buyfitur.js", metadata, m, extra)
handler.help = ["umi-user-buyfitur [nama_fitur]"]
handler.command = ["umi-user-buyfitur", "umi-buyfitur", "umi-belifitur", "umi-purchasefeature", "umi-buyfeature", "buyfitur", "belifitur", "purchasefeature", "buyfeature"]
handler.tags = ["user"]
handler.description = "Beli fitur premium (1 fitur = 3000 koin)"
handler.importSource = "umi"
handler.importConfig = {"name": "buyfitur", "alias": ["belifitur", "purchasefeature", "buyfeature"], "category": "user", "description": "Beli fitur premium (1 fitur = 3000 koin)", "usage": ".buyfitur [nama_fitur]", "example": ".buyfitur", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-user-buyfitur": "buyfitur", "umi-buyfitur": "buyfitur", "umi-belifitur": "belifitur", "umi-purchasefeature": "purchasefeature", "umi-buyfeature": "buyfeature", "buyfitur": "buyfitur", "belifitur": "belifitur", "purchasefeature": "purchasefeature", "buyfeature": "buyfeature"}
export default handler
