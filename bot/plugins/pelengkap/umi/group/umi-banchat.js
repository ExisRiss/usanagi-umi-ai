/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "banchat", "category": "group", "aliasMap": {"umi-group-banchat": "banchat", "umi-banchat": "banchat", "umi-bangroup": "bangroup", "umi-bangrup": "bangrup", "umi-unbanchat": "unbanchat", "umi-unbangroup": "unbangroup"}, "description": "Ban grup dari penggunaan bot (hanya owner yang bisa akses)", "usage": ".banchat", "example": ".banchat", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/banchat.js", metadata, m, extra)
handler.help = ["umi-group-banchat"]
handler.command = ["umi-group-banchat", "umi-banchat", "umi-bangroup", "umi-bangrup", "umi-unbanchat", "umi-unbangroup"]
handler.tags = ["group"]
handler.description = "Ban grup dari penggunaan bot (hanya owner yang bisa akses)"
handler.importSource = "umi"
handler.importConfig = {"name": "banchat", "alias": ["bangroup", "bangrup", "unbanchat", "unbangroup"], "category": "group", "description": "Ban grup dari penggunaan bot (hanya owner yang bisa akses)", "usage": ".banchat", "example": ".banchat", "isOwner": true, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-banchat": "banchat", "umi-banchat": "banchat", "umi-bangroup": "bangroup", "umi-bangrup": "bangrup", "umi-unbanchat": "unbanchat", "umi-unbangroup": "unbangroup"}
export default handler
