/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "renungan", "category": "fun", "aliasMap": {"umi-fun-renungan": "renungan", "umi-renungan": "renungan", "umi-motivasi": "motivasi", "umi-mutiara": "mutiara", "motivasi": "motivasi", "mutiara": "mutiara"}, "description": "Random gambar renungan/motivasi", "usage": ".renungan", "example": ".renungan", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/fun/renungan.js", metadata, m, extra)
handler.help = ["umi-fun-renungan"]
handler.command = ["umi-fun-renungan", "umi-renungan", "umi-motivasi", "umi-mutiara", "motivasi", "mutiara"]
handler.tags = ["fun"]
handler.description = "Random gambar renungan/motivasi"
handler.importSource = "umi"
handler.importConfig = {"name": "renungan", "alias": ["motivasi", "mutiara"], "category": "fun", "description": "Random gambar renungan/motivasi", "usage": ".renungan", "example": ".renungan", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-fun-renungan": "renungan", "umi-renungan": "renungan", "umi-motivasi": "motivasi", "umi-mutiara": "mutiara", "motivasi": "motivasi", "mutiara": "mutiara"}
export default handler
