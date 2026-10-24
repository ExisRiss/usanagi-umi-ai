/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "puasa", "category": "religi", "aliasMap": {"umi-religi-puasa": "puasa", "umi-puasa": "puasa", "umi-puasasunnah": "puasasunnah", "umi-puasasenin": "puasasenin", "umi-puasakamis": "puasakamis", "umi-puasadawud": "puasadawud", "puasa": "puasa", "puasasunnah": "puasasunnah", "puasasenin": "puasasenin", "puasakamis": "puasakamis", "puasadawud": "puasadawud"}, "description": "Panduan Puasa Sunnah Lengkap (Senin-Kamis, Dawud, Arafah, Asyura, dll)", "usage": ".puasa <nama puasa>", "example": ".puasa senin", "cooldown": 3}
const handler = (m, extra) => runImportedFeature("umi", "plugins/islamic/puasa.js", metadata, m, extra)
handler.help = ["umi-religi-puasa <nama puasa>"]
handler.command = ["umi-religi-puasa", "umi-puasa", "umi-puasasunnah", "umi-puasasenin", "umi-puasakamis", "umi-puasadawud", "puasa", "puasasunnah", "puasasenin", "puasakamis", "puasadawud"]
handler.tags = ["religi"]
handler.description = "Panduan Puasa Sunnah Lengkap (Senin-Kamis, Dawud, Arafah, Asyura, dll)"
handler.importSource = "umi"
handler.importConfig = {"name": "puasa", "alias": ["puasasunnah", "puasasenin", "puasakamis", "puasadawud"], "category": "religi", "description": "Panduan Puasa Sunnah Lengkap (Senin-Kamis, Dawud, Arafah, Asyura, dll)", "usage": ".puasa <nama puasa>", "example": ".puasa senin", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-religi-puasa": "puasa", "umi-puasa": "puasa", "umi-puasasunnah": "puasasunnah", "umi-puasasenin": "puasasenin", "umi-puasakamis": "puasakamis", "umi-puasadawud": "puasadawud", "puasa": "puasa", "puasasunnah": "puasasunnah", "puasasenin": "puasasenin", "puasakamis": "puasakamis", "puasadawud": "puasadawud"}
export default handler
