/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "ayatkursi", "category": "islamic", "aliasMap": {"umi-islamic-ayatkursi": "ayatkursi", "umi-ayatkursi": "ayatkursi", "ayatkursi": "ayatkursi"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/islamic/ayat-kursi.js", metadata, m, extra)
handler.help = ["umi-islamic-ayatkursi"]
handler.command = ["umi-islamic-ayatkursi", "umi-ayatkursi", "ayatkursi"]
handler.tags = ["islamic"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "ayatkursi", "alias": [], "category": "islamic", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-islamic-ayatkursi": "ayatkursi", "umi-ayatkursi": "ayatkursi", "ayatkursi": "ayatkursi"}
export default handler
