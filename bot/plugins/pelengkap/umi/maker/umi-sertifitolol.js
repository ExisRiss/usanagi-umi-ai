import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "sertiftolol", "category": "maker", "aliasMap": {"umi-maker-sertiftolol": "sertiftolol", "umi-sertiftolol": "sertiftolol", "umi-sertifikattolol": "sertifikattolol", "sertiftolol": "sertiftolol", "sertifikattolol": "sertifikattolol"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/maker/sertifitolol.js", metadata, m, extra)
handler.help = ["umi-maker-sertiftolol"]
handler.command = ["umi-maker-sertiftolol", "umi-sertiftolol", "umi-sertifikattolol", "sertiftolol", "sertifikattolol"]
handler.tags = ["maker"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "sertiftolol", "alias": ["sertifikattolol"], "category": "maker", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-maker-sertiftolol": "sertiftolol", "umi-sertiftolol": "sertiftolol", "umi-sertifikattolol": "sertifikattolol", "sertiftolol": "sertiftolol", "sertifikattolol": "sertifikattolol"}
export default handler
