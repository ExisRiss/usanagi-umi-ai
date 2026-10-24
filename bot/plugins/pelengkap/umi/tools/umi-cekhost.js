import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "checkhost", "category": "tools", "aliasMap": {"umi-tools-checkhost": "checkhost", "umi-checkhost": "checkhost", "umi-cekhost": "cekhost", "umi-check": "check", "checkhost": "checkhost", "cekhost": "cekhost", "check": "check"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/cekhost.js", metadata, m, extra)
handler.help = ["umi-tools-checkhost"]
handler.command = ["umi-tools-checkhost", "umi-checkhost", "umi-cekhost", "umi-check", "checkhost", "cekhost", "check"]
handler.tags = ["tools"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "checkhost", "alias": ["cekhost", "check"], "category": "tools", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-tools-checkhost": "checkhost", "umi-checkhost": "checkhost", "umi-cekhost": "cekhost", "umi-check": "check", "checkhost": "checkhost", "cekhost": "cekhost", "check": "check"}
export default handler
