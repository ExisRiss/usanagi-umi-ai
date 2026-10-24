/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "stopbcpc", "category": "owner", "aliasMap": {"umi-owner-stopbcpc": "stopbcpc", "umi-stopbcpc": "stopbcpc", "umi-stopbroadcastpc": "stopbroadcastpc", "stopbcpc": "stopbcpc", "stopbroadcastpc": "stopbroadcastpc"}, "description": "Hentikan broadcast private yang sedang berjalan", "usage": ".stopbcpc", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/stopbcpc.js", metadata, m, extra)
handler.help = ["umi-owner-stopbcpc"]
handler.command = ["umi-owner-stopbcpc", "umi-stopbcpc", "umi-stopbroadcastpc", "stopbcpc", "stopbroadcastpc"]
handler.tags = ["owner"]
handler.description = "Hentikan broadcast private yang sedang berjalan"
handler.importSource = "umi"
handler.importConfig = {"name": "stopbcpc", "alias": ["stopbroadcastpc"], "category": "owner", "description": "Hentikan broadcast private yang sedang berjalan", "usage": ".stopbcpc", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-stopbcpc": "stopbcpc", "umi-stopbcpc": "stopbcpc", "umi-stopbroadcastpc": "stopbroadcastpc", "stopbcpc": "stopbcpc", "stopbroadcastpc": "stopbroadcastpc"}
export default handler
