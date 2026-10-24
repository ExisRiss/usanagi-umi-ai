/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "fakegopay", "category": "canvas", "aliasMap": {"umi-canvas-fakegopay": "fakegopay", "umi-fakegopay": "fakegopay", "fakegopay": "fakegopay"}, "description": "Membuat canvas fake gopay", "usage": ".fakegopay <saldo>|<coin>|<terpakai>|<bulan>", "example": ".fakegopay 100000|500|20000|Januari", "cooldown": 5, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/fakegopay.js", metadata, m, extra)
handler.help = ["umi-canvas-fakegopay <saldo>|<coin>|<terpakai>|<bulan>"]
handler.command = ["umi-canvas-fakegopay", "umi-fakegopay", "fakegopay"]
handler.tags = ["canvas"]
handler.description = "Membuat canvas fake gopay"
handler.importSource = "umi"
handler.importConfig = {"name": "fakegopay", "alias": ["fakegopay"], "category": "canvas", "description": "Membuat canvas fake gopay", "usage": ".fakegopay <saldo>|<coin>|<terpakai>|<bulan>", "example": ".fakegopay 100000|500|20000|Januari", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-fakegopay": "fakegopay", "umi-fakegopay": "fakegopay", "fakegopay": "fakegopay"}
export default handler
