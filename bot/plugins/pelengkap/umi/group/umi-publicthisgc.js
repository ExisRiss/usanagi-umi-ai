import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "publicthisgc", "category": "group", "aliasMap": {"umi-group-publicthisgc": "publicthisgc", "umi-publicthisgc": "publicthisgc", "umi-publicgc": "publicgc", "umi-publicgroup": "publicgroup", "umi-publicthisgroup": "publicthisgroup", "publicthisgc": "publicthisgc", "publicgc": "publicgc", "publicgroup": "publicgroup", "publicthisgroup": "publicthisgroup"}, "description": "Aktifkan mode public hanya di grup ini", "usage": ".publicthisgc", "example": ".publicthisgc", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/publicthisgc.js", metadata, m, extra)
handler.help = ["umi-group-publicthisgc"]
handler.command = ["umi-group-publicthisgc", "umi-publicthisgc", "umi-publicgc", "umi-publicgroup", "umi-publicthisgroup", "publicthisgc", "publicgc", "publicgroup", "publicthisgroup"]
handler.tags = ["group"]
handler.description = "Aktifkan mode public hanya di grup ini"
handler.importSource = "umi"
handler.importConfig = {"name": "publicthisgc", "alias": ["publicgc", "publicgroup", "publicthisgroup"], "category": "group", "description": "Aktifkan mode public hanya di grup ini", "usage": ".publicthisgc", "example": ".publicthisgc", "isOwner": true, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-publicthisgc": "publicthisgc", "umi-publicthisgc": "publicthisgc", "umi-publicgc": "publicgc", "umi-publicgroup": "publicgroup", "umi-publicthisgroup": "publicthisgroup", "publicthisgc": "publicthisgc", "publicgc": "publicgc", "publicgroup": "publicgroup", "publicthisgroup": "publicthisgroup"}
export default handler
