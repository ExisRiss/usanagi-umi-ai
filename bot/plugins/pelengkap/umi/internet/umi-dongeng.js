/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "dongeng", "category": "internet", "aliasMap": {"umi-internet-dongeng": "dongeng", "umi-dongeng": "dongeng", "umi-cerita": "cerita", "umi-dongengku": "dongengku", "dongeng": "dongeng", "cerita": "cerita", "dongengku": "dongengku"}, "description": "Cari dan baca dongeng dari 1000dongeng.com", "usage": ".dongeng <judul>", "example": ".dongeng Pahlawan", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/internet/dongeng.js", metadata, m, extra)
handler.help = ["umi-internet-dongeng <judul>"]
handler.command = ["umi-internet-dongeng", "umi-dongeng", "umi-cerita", "umi-dongengku", "dongeng", "cerita", "dongengku"]
handler.tags = ["internet"]
handler.description = "Cari dan baca dongeng dari 1000dongeng.com"
handler.importSource = "umi"
handler.importConfig = {"name": "dongeng", "alias": ["cerita", "dongengku"], "category": "internet", "description": "Cari dan baca dongeng dari 1000dongeng.com", "usage": ".dongeng <judul>", "example": ".dongeng Pahlawan", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-internet-dongeng": "dongeng", "umi-dongeng": "dongeng", "umi-cerita": "cerita", "umi-dongengku": "dongengku", "dongeng": "dongeng", "cerita": "cerita", "dongengku": "dongengku"}
export default handler
