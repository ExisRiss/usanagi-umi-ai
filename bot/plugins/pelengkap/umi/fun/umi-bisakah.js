/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "bisakah", "category": "fun", "aliasMap": {"umi-fun-bisakah": "bisakah", "umi-bisakah": "bisakah", "umi-bisa": "bisa"}, "description": "Tanya bot bisakah sesuatu", "usage": ".bisakah <pertanyaan>", "example": ".bisakah aku lulus ujian?", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/fun/bisakah.js", metadata, m, extra)
handler.help = ["umi-fun-bisakah <pertanyaan>"]
handler.command = ["umi-fun-bisakah", "umi-bisakah", "umi-bisa"]
handler.tags = ["fun"]
handler.description = "Tanya bot bisakah sesuatu"
handler.importSource = "umi"
handler.importConfig = {"name": "bisakah", "alias": ["bisa"], "category": "fun", "description": "Tanya bot bisakah sesuatu", "usage": ".bisakah <pertanyaan>", "example": ".bisakah aku lulus ujian?", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-fun-bisakah": "bisakah", "umi-bisakah": "bisakah", "umi-bisa": "bisa"}
export default handler
