import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "getppgc", "category": "group", "aliasMap": {"umi-group-getppgc": "getppgc", "umi-getppgc": "getppgc", "umi-ppgc": "ppgc", "getppgc": "getppgc", "ppgc": "ppgc"}, "description": "Mengambil foto profile group", "usage": ".getppgc", "example": ".getppgc", "cooldown": 10, "energi": 3}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/getppgc.js", metadata, m, extra)
handler.help = ["umi-group-getppgc"]
handler.command = ["umi-group-getppgc", "umi-getppgc", "umi-ppgc", "getppgc", "ppgc"]
handler.tags = ["group"]
handler.description = "Mengambil foto profile group"
handler.importSource = "umi"
handler.importConfig = {"name": "getppgc", "alias": ["ppgc"], "category": "group", "description": "Mengambil foto profile group", "usage": ".getppgc", "example": ".getppgc", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 10, "energi": 3, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-group-getppgc": "getppgc", "umi-getppgc": "getppgc", "umi-ppgc": "ppgc", "getppgc": "getppgc", "ppgc": "ppgc"}
export default handler
