import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "listsewa", "category": "owner", "aliasMap": {"umi-owner-listsewa": "listsewa", "umi-listsewa": "listsewa", "umi-sewalist": "sewalist", "umi-daftarsewa": "daftarsewa", "listsewa": "listsewa", "sewalist": "sewalist", "daftarsewa": "daftarsewa"}, "description": "Lihat daftar grup yang terdaftar sewa", "usage": ".listsewa", "example": ".listsewa", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/listsewa.js", metadata, m, extra)
handler.help = ["umi-owner-listsewa"]
handler.command = ["umi-owner-listsewa", "umi-listsewa", "umi-sewalist", "umi-daftarsewa", "listsewa", "sewalist", "daftarsewa"]
handler.tags = ["owner"]
handler.description = "Lihat daftar grup yang terdaftar sewa"
handler.importSource = "umi"
handler.importConfig = {"name": "listsewa", "alias": ["sewalist", "daftarsewa"], "category": "owner", "description": "Lihat daftar grup yang terdaftar sewa", "usage": ".listsewa", "example": ".listsewa", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-listsewa": "listsewa", "umi-listsewa": "listsewa", "umi-sewalist": "sewalist", "umi-daftarsewa": "daftarsewa", "listsewa": "listsewa", "sewalist": "sewalist", "daftarsewa": "daftarsewa"}
export default handler
