/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "akankah", "category": "fun", "aliasMap": {"umi-fun-akankah": "akankah", "umi-akankah": "akankah", "umi-akan": "akan", "umi-will": "will", "will": "will"}, "description": "Tanya bot akankah sesuatu terjadi", "usage": ".akankah <pertanyaan>", "example": ".akankah aku sukses?", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/fun/akankah.js", metadata, m, extra)
handler.help = ["umi-fun-akankah <pertanyaan>"]
handler.command = ["umi-fun-akankah", "umi-akankah", "umi-akan", "umi-will", "will"]
handler.tags = ["fun"]
handler.description = "Tanya bot akankah sesuatu terjadi"
handler.importSource = "umi"
handler.importConfig = {"name": "akankah", "alias": ["akan", "will"], "category": "fun", "description": "Tanya bot akankah sesuatu terjadi", "usage": ".akankah <pertanyaan>", "example": ".akankah aku sukses?", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-fun-akankah": "akankah", "umi-akankah": "akankah", "umi-akan": "akan", "umi-will": "will", "will": "will"}
export default handler
