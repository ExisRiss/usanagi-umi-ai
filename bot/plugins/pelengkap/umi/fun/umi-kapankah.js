/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "kapankah", "category": "fun", "aliasMap": {"umi-fun-kapankah": "kapankah", "umi-kapankah": "kapankah", "kapankah": "kapankah"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/fun/kapankah.js", metadata, m, extra)
handler.help = ["umi-fun-kapankah"]
handler.command = ["umi-fun-kapankah", "umi-kapankah", "kapankah"]
handler.tags = ["fun"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "kapankah", "alias": [], "category": "fun", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-fun-kapankah": "kapankah", "umi-kapankah": "kapankah", "kapankah": "kapankah"}
export default handler
