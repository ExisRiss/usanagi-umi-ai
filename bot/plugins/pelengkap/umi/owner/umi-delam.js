import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "delam", "category": "owner", "aliasMap": {"umi-owner-delam": "delam", "umi-delam": "delam", "umi-delamrole": "delamrole", "umi-unam": "unam", "umi-removeam": "removeam", "delam": "delam", "delamrole": "delamrole", "unam": "unam", "removeam": "removeam"}, "description": "Hapus role AM (jadi free)", "usage": ".delam <@tag|reply|628xxx>", "example": ".delam 6283xxx", "cooldown": 3}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/delam.js", metadata, m, extra)
handler.help = ["umi-owner-delam <@tag|reply|628xxx>"]
handler.command = ["umi-owner-delam", "umi-delam", "umi-delamrole", "umi-unam", "umi-removeam", "delam", "delamrole", "unam", "removeam"]
handler.tags = ["owner"]
handler.description = "Hapus role AM (jadi free)"
handler.importSource = "umi"
handler.importConfig = {"name": "delam", "alias": ["delamrole", "unam", "removeam"], "category": "owner", "description": "Hapus role AM (jadi free)", "usage": ".delam <@tag|reply|628xxx>", "example": ".delam 6283xxx", "isOwner": false, "isPremium": false, "cooldown": 3, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-delam": "delam", "umi-delam": "delam", "umi-delamrole": "delamrole", "umi-unam": "unam", "umi-removeam": "removeam", "delam": "delam", "delamrole": "delamrole", "unam": "unam", "removeam": "removeam"}
export default handler
