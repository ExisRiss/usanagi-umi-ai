/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "myorder", "category": "store", "aliasMap": {"umi-store-myorder": "myorder", "umi-myorder": "myorder", "umi-orderku": "orderku", "umi-cekorder": "cekorder", "umi-pesananku": "pesananku", "myorder": "myorder", "orderku": "orderku", "cekorder": "cekorder", "pesananku": "pesananku"}, "description": "Lihat order kamu", "usage": ".myorder", "example": ".myorder", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/store/myorder.js", metadata, m, extra)
handler.help = ["umi-store-myorder"]
handler.command = ["umi-store-myorder", "umi-myorder", "umi-orderku", "umi-cekorder", "umi-pesananku", "myorder", "orderku", "cekorder", "pesananku"]
handler.tags = ["store"]
handler.description = "Lihat order kamu"
handler.importSource = "umi"
handler.importConfig = {"name": "myorder", "alias": ["orderku", "cekorder", "pesananku"], "category": "store", "description": "Lihat order kamu", "usage": ".myorder", "example": ".myorder", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-store-myorder": "myorder", "umi-myorder": "myorder", "umi-orderku": "orderku", "umi-cekorder": "cekorder", "umi-pesananku": "pesananku", "myorder": "myorder", "orderku": "orderku", "cekorder": "cekorder", "pesananku": "pesananku"}
export default handler
