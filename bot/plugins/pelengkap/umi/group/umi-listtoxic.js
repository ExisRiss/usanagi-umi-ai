import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "listtoxic", "category": "group", "aliasMap": {"umi-group-listtoxic": "listtoxic", "umi-listtoxic": "listtoxic", "umi-toxiclist": "toxiclist", "umi-katatoxic": "katatoxic", "umi-lihatkata": "lihatkata", "listtoxic": "listtoxic", "toxiclist": "toxiclist", "katatoxic": "katatoxic", "lihatkata": "lihatkata"}, "description": "Lihat daftar kata toxic", "usage": ".listtoxic", "example": ".listtoxic", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/listtoxic.js", metadata, m, extra)
handler.help = ["umi-group-listtoxic"]
handler.command = ["umi-group-listtoxic", "umi-listtoxic", "umi-toxiclist", "umi-katatoxic", "umi-lihatkata", "listtoxic", "toxiclist", "katatoxic", "lihatkata"]
handler.tags = ["group"]
handler.description = "Lihat daftar kata toxic"
handler.importSource = "umi"
handler.importConfig = {"name": "listtoxic", "alias": ["toxiclist", "katatoxic", "lihatkata"], "category": "group", "description": "Lihat daftar kata toxic", "usage": ".listtoxic", "example": ".listtoxic", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "isAdmin": true, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = true
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-listtoxic": "listtoxic", "umi-listtoxic": "listtoxic", "umi-toxiclist": "toxiclist", "umi-katatoxic": "katatoxic", "umi-lihatkata": "lihatkata", "listtoxic": "listtoxic", "toxiclist": "toxiclist", "katatoxic": "katatoxic", "lihatkata": "lihatkata"}
export default handler
