import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "pacarsertifikat", "category": "canvas", "aliasMap": {"umi-canvas-pacarsertifikat": "pacarsertifikat", "umi-pacarsertifikat": "pacarsertifikat", "umi-sertifikatpacar": "sertifikatpacar", "umi-certpacar": "certpacar", "umi-pacarcert": "pacarcert", "pacarsertifikat": "pacarsertifikat", "sertifikatpacar": "sertifikatpacar", "certpacar": "certpacar", "pacarcert": "pacarcert"}, "description": "Membuat sertifikat pacar", "usage": ".pacarsertifikat <nama1> <nama2>", "example": ".pacarsertifikat Budi Ani", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/pacarsertifikat.js", metadata, m, extra)
handler.help = ["umi-canvas-pacarsertifikat <nama1> <nama2>"]
handler.command = ["umi-canvas-pacarsertifikat", "umi-pacarsertifikat", "umi-sertifikatpacar", "umi-certpacar", "umi-pacarcert", "pacarsertifikat", "sertifikatpacar", "certpacar", "pacarcert"]
handler.tags = ["canvas"]
handler.description = "Membuat sertifikat pacar"
handler.importSource = "umi"
handler.importConfig = {"name": "pacarsertifikat", "alias": ["sertifikatpacar", "certpacar", "pacarcert"], "category": "canvas", "description": "Membuat sertifikat pacar", "usage": ".pacarsertifikat <nama1> <nama2>", "example": ".pacarsertifikat Budi Ani", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-pacarsertifikat": "pacarsertifikat", "umi-pacarsertifikat": "pacarsertifikat", "umi-sertifikatpacar": "sertifikatpacar", "umi-certpacar": "certpacar", "umi-pacarcert": "pacarcert", "pacarsertifikat": "pacarsertifikat", "sertifikatpacar": "sertifikatpacar", "certpacar": "certpacar", "pacarcert": "pacarcert"}
export default handler
