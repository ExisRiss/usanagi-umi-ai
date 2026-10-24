import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "selfthisgc", "category": "group", "aliasMap": {"umi-group-selfthisgc": "selfthisgc", "umi-selfthisgc": "selfthisgc", "umi-selfgc": "selfgc", "umi-selfgroup": "selfgroup", "umi-selfthisgroup": "selfthisgroup", "selfthisgc": "selfthisgc", "selfgc": "selfgc", "selfgroup": "selfgroup", "selfthisgroup": "selfthisgroup"}, "description": "Aktifkan mode self hanya di grup ini", "usage": ".selfthisgc", "example": ".selfthisgc", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/selfthisgc.js", metadata, m, extra)
handler.help = ["umi-group-selfthisgc"]
handler.command = ["umi-group-selfthisgc", "umi-selfthisgc", "umi-selfgc", "umi-selfgroup", "umi-selfthisgroup", "selfthisgc", "selfgc", "selfgroup", "selfthisgroup"]
handler.tags = ["group"]
handler.description = "Aktifkan mode self hanya di grup ini"
handler.importSource = "umi"
handler.importConfig = {"name": "selfthisgc", "alias": ["selfgc", "selfgroup", "selfthisgroup"], "category": "group", "description": "Aktifkan mode self hanya di grup ini", "usage": ".selfthisgc", "example": ".selfthisgc", "isOwner": true, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-selfthisgc": "selfthisgc", "umi-selfthisgc": "selfthisgc", "umi-selfgc": "selfgc", "umi-selfgroup": "selfgroup", "umi-selfthisgroup": "selfthisgroup", "selfthisgc": "selfthisgc", "selfgc": "selfgc", "selfgroup": "selfgroup", "selfthisgroup": "selfthisgroup"}
export default handler
