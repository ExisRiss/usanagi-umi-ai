import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "juarabadminton", "category": "canvas", "aliasMap": {"umi-canvas-juarabadminton": "juarabadminton", "umi-juarabadminton": "juarabadminton", "umi-sertifikatbadminton": "sertifikatbadminton", "umi-badmintoncert": "badmintoncert", "umi-badminton": "badminton", "juarabadminton": "juarabadminton", "sertifikatbadminton": "sertifikatbadminton", "badmintoncert": "badmintoncert", "badminton": "badminton"}, "description": "Membuat sertifikat Juara Badminton kustom", "usage": ".juarabadminton <nama>", "example": ".juarabadminton Alex", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/juarabadminton.js", metadata, m, extra)
handler.help = ["umi-canvas-juarabadminton <nama>"]
handler.command = ["umi-canvas-juarabadminton", "umi-juarabadminton", "umi-sertifikatbadminton", "umi-badmintoncert", "umi-badminton", "juarabadminton", "sertifikatbadminton", "badmintoncert", "badminton"]
handler.tags = ["canvas"]
handler.description = "Membuat sertifikat Juara Badminton kustom"
handler.importSource = "umi"
handler.importConfig = {"name": "juarabadminton", "alias": ["sertifikatbadminton", "badmintoncert", "badminton"], "category": "canvas", "description": "Membuat sertifikat Juara Badminton kustom", "usage": ".juarabadminton <nama>", "example": ".juarabadminton Alex", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-juarabadminton": "juarabadminton", "umi-juarabadminton": "juarabadminton", "umi-sertifikatbadminton": "sertifikatbadminton", "umi-badmintoncert": "badmintoncert", "umi-badminton": "badminton", "juarabadminton": "juarabadminton", "sertifikatbadminton": "sertifikatbadminton", "badmintoncert": "badmintoncert", "badminton": "badminton"}
export default handler
