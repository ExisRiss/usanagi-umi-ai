import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "sertifikatcinta", "category": "maker", "aliasMap": {"umi-maker-sertifikatcinta": "sertifikatcinta", "umi-sertifikatcinta": "sertifikatcinta", "sertifikatcinta": "sertifikatcinta"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/maker/sertifikatcinta.js", metadata, m, extra)
handler.help = ["umi-maker-sertifikatcinta"]
handler.command = ["umi-maker-sertifikatcinta", "umi-sertifikatcinta", "sertifikatcinta"]
handler.tags = ["maker"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "sertifikatcinta", "alias": [], "category": "maker", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-maker-sertifikatcinta": "sertifikatcinta", "umi-sertifikatcinta": "sertifikatcinta", "sertifikatcinta": "sertifikatcinta"}
export default handler
