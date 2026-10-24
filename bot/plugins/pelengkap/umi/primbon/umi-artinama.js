/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "artinama", "category": "primbon", "aliasMap": {"umi-primbon-artinama": "artinama", "umi-artinama": "artinama", "umi-namameaning": "namameaning", "umi-artinamaku": "artinamaku", "artinama": "artinama", "namameaning": "namameaning", "artinamaku": "artinamaku"}, "description": "Cek arti nama menurut primbon", "usage": ".artinama <nama>", "example": ".artinama putu", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/primbon/artinama.js", metadata, m, extra)
handler.help = ["umi-primbon-artinama <nama>"]
handler.command = ["umi-primbon-artinama", "umi-artinama", "umi-namameaning", "umi-artinamaku", "artinama", "namameaning", "artinamaku"]
handler.tags = ["primbon"]
handler.description = "Cek arti nama menurut primbon"
handler.importSource = "umi"
handler.importConfig = {"name": "artinama", "alias": ["namameaning", "artinamaku"], "category": "primbon", "description": "Cek arti nama menurut primbon", "usage": ".artinama <nama>", "example": ".artinama putu", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-primbon-artinama": "artinama", "umi-artinama": "artinama", "umi-namameaning": "namameaning", "umi-artinamaku": "artinamaku", "artinama": "artinama", "namameaning": "namameaning", "artinamaku": "artinamaku"}
export default handler
