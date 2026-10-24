import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cekrek", "category": "tools", "aliasMap": {"umi-tools-cekrek": "cekrek", "umi-cekrek": "cekrek", "umi-cekrekening": "cekrekening", "cekrek": "cekrek", "cekrekening": "cekrekening"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/cekrek.js", metadata, m, extra)
handler.help = ["umi-tools-cekrek"]
handler.command = ["umi-tools-cekrek", "umi-cekrek", "umi-cekrekening", "cekrek", "cekrekening"]
handler.tags = ["tools"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "cekrek", "alias": ["cekrekening"], "category": "tools", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-tools-cekrek": "cekrek", "umi-cekrek": "cekrek", "umi-cekrekening": "cekrekening", "cekrek": "cekrek", "cekrekening": "cekrekening"}
export default handler
