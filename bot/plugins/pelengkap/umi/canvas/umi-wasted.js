/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "wasted", "category": "maker", "aliasMap": {"umi-maker-wasted": "wasted", "umi-wasted": "wasted", "umi-gta": "gta", "umi-gtawasted": "gtawasted", "wasted": "wasted", "gta": "gta", "gtawasted": "gtawasted"}, "description": "Efek wasted GTA pada foto", "usage": ".wasted (reply foto)", "example": ".wasted", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/wasted.js", metadata, m, extra)
handler.help = ["umi-maker-wasted (reply foto)"]
handler.command = ["umi-maker-wasted", "umi-wasted", "umi-gta", "umi-gtawasted", "wasted", "gta", "gtawasted"]
handler.tags = ["maker"]
handler.description = "Efek wasted GTA pada foto"
handler.importSource = "umi"
handler.importConfig = {"name": "wasted", "alias": ["gta", "gtawasted"], "category": "maker", "description": "Efek wasted GTA pada foto", "usage": ".wasted (reply foto)", "example": ".wasted", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-maker-wasted": "wasted", "umi-wasted": "wasted", "umi-gta": "gta", "umi-gtawasted": "gtawasted", "wasted": "wasted", "gta": "gta", "gtawasted": "gtawasted"}
export default handler
