import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "checksewa", "category": "group", "aliasMap": {"umi-group-checksewa": "checksewa", "umi-checksewa": "checksewa", "umi-ceksewa": "ceksewa", "umi-sisasewa": "sisasewa", "checksewa": "checksewa", "ceksewa": "ceksewa", "sisasewa": "sisasewa"}, "description": "Cek sisa waktu sewa bot di grup ini", "usage": ".checksewa", "example": ".checksewa", "cooldown": 10, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/checksewa.js", metadata, m, extra)
handler.help = ["umi-group-checksewa"]
handler.command = ["umi-group-checksewa", "umi-checksewa", "umi-ceksewa", "umi-sisasewa", "checksewa", "ceksewa", "sisasewa"]
handler.tags = ["group"]
handler.description = "Cek sisa waktu sewa bot di grup ini"
handler.importSource = "umi"
handler.importConfig = {"name": "checksewa", "alias": ["ceksewa", "sisasewa"], "category": "group", "description": "Cek sisa waktu sewa bot di grup ini", "usage": ".checksewa", "example": ".checksewa", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "isAdmin": false, "cooldown": 10, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-checksewa": "checksewa", "umi-checksewa": "checksewa", "umi-ceksewa": "ceksewa", "umi-sisasewa": "sisasewa", "checksewa": "checksewa", "ceksewa": "ceksewa", "sisasewa": "sisasewa"}
export default handler
