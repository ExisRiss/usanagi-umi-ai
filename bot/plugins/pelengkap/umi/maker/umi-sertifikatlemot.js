import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "sertifikatlemot", "category": "maker", "aliasMap": {"umi-maker-sertifikatlemot": "sertifikatlemot", "umi-sertifikatlemot": "sertifikatlemot", "sertifikatlemot": "sertifikatlemot"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/maker/sertifikatlemot.js", metadata, m, extra)
handler.help = ["umi-maker-sertifikatlemot"]
handler.command = ["umi-maker-sertifikatlemot", "umi-sertifikatlemot", "sertifikatlemot"]
handler.tags = ["maker"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "sertifikatlemot", "alias": [], "category": "maker", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-maker-sertifikatlemot": "sertifikatlemot", "umi-sertifikatlemot": "sertifikatlemot", "sertifikatlemot": "sertifikatlemot"}
export default handler
