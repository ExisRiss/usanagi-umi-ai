/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "sertifikatnasa", "category": "maker", "aliasMap": {"umi-maker-sertifikatnasa": "sertifikatnasa", "umi-sertifikatnasa": "sertifikatnasa", "umi-nasacert": "nasacert", "umi-sertifnasa": "sertifnasa", "umi-sertifikat-nasa": "sertifikat-nasa", "sertifikatnasa": "sertifikatnasa", "nasacert": "nasacert", "sertifnasa": "sertifnasa", "sertifikat-nasa": "sertifikat-nasa"}, "description": "Generate gambar Sertifikat NASA dengan nama custom", "usage": ".sertifikatnasa <nama>", "example": ".sertifikatnasa John Doe", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/maker/sertifikatnasa.js", metadata, m, extra)
handler.help = ["umi-maker-sertifikatnasa <nama>"]
handler.command = ["umi-maker-sertifikatnasa", "umi-sertifikatnasa", "umi-nasacert", "umi-sertifnasa", "umi-sertifikat-nasa", "sertifikatnasa", "nasacert", "sertifnasa", "sertifikat-nasa"]
handler.tags = ["maker"]
handler.description = "Generate gambar Sertifikat NASA dengan nama custom"
handler.importSource = "umi"
handler.importConfig = {"name": "sertifikatnasa", "alias": ["nasacert", "sertifnasa", "sertifikat-nasa"], "category": "maker", "description": "Generate gambar Sertifikat NASA dengan nama custom", "usage": ".sertifikatnasa <nama>", "example": ".sertifikatnasa John Doe", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-maker-sertifikatnasa": "sertifikatnasa", "umi-sertifikatnasa": "sertifikatnasa", "umi-nasacert": "nasacert", "umi-sertifnasa": "sertifnasa", "umi-sertifikat-nasa": "sertifikat-nasa", "sertifikatnasa": "sertifikatnasa", "nasacert": "nasacert", "sertifnasa": "sertifnasa", "sertifikat-nasa": "sertifikat-nasa"}
export default handler
