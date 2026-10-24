/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "mandiwajib", "category": "religi", "aliasMap": {"umi-religi-mandiwajib": "mandiwajib", "umi-mandiwajib": "mandiwajib", "umi-caramandiwajib": "caramandiwajib", "umi-mandi-wajib": "mandi-wajib", "mandiwajib": "mandiwajib", "caramandiwajib": "caramandiwajib", "mandi-wajib": "mandi-wajib"}, "description": "Panduan cara mandi wajib beserta doa", "usage": ".mandiwajib", "example": ".mandiwajib", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/islamic/mandiwajib.js", metadata, m, extra)
handler.help = ["umi-religi-mandiwajib"]
handler.command = ["umi-religi-mandiwajib", "umi-mandiwajib", "umi-caramandiwajib", "umi-mandi-wajib", "mandiwajib", "caramandiwajib", "mandi-wajib"]
handler.tags = ["religi"]
handler.description = "Panduan cara mandi wajib beserta doa"
handler.importSource = "umi"
handler.importConfig = {"name": "mandiwajib", "alias": ["caramandiwajib", "mandiwajib", "mandi-wajib"], "category": "religi", "description": "Panduan cara mandi wajib beserta doa", "usage": ".mandiwajib", "example": ".mandiwajib", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-religi-mandiwajib": "mandiwajib", "umi-mandiwajib": "mandiwajib", "umi-caramandiwajib": "caramandiwajib", "umi-mandi-wajib": "mandi-wajib", "mandiwajib": "mandiwajib", "caramandiwajib": "caramandiwajib", "mandi-wajib": "mandi-wajib"}
export default handler
