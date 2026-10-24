/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "gag2watch", "category": "info", "aliasMap": {"umi-info-gag2watch": "gag2watch", "umi-gag2watch": "gag2watch", "umi-gag2-watch": "gag2-watch", "gag2watch": "gag2watch", "gag2-watch": "gag2-watch"}, "description": "Cek informasi stok GAG2 Watch", "usage": ".gag2-watch", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/info/gagwatch.js", metadata, m, extra)
handler.help = ["umi-info-gag2watch"]
handler.command = ["umi-info-gag2watch", "umi-gag2watch", "umi-gag2-watch", "gag2watch", "gag2-watch"]
handler.tags = ["info"]
handler.description = "Cek informasi stok GAG2 Watch"
handler.importSource = "umi"
handler.importConfig = {"name": "gag2watch", "alias": ["gag2-watch"], "category": "info", "description": "Cek informasi stok GAG2 Watch", "usage": ".gag2-watch", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-info-gag2watch": "gag2watch", "umi-gag2watch": "gag2watch", "umi-gag2-watch": "gag2-watch", "gag2watch": "gag2watch", "gag2-watch": "gag2-watch"}
export default handler
