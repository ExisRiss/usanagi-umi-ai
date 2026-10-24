/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cekkontol", "category": "fun", "aliasMap": {"umi-fun-cekkontol": "cekkontol", "umi-cekkontol": "cekkontol", "umi-kontolcheck": "kontolcheck", "cekkontol": "cekkontol", "kontolcheck": "kontolcheck"}, "description": "Cek ukuran random (bercanda doang)", "usage": ".cekkontol <nama>", "example": ".cekkontol Budi", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/fun/cekkontol.js", metadata, m, extra)
handler.help = ["umi-fun-cekkontol <nama>"]
handler.command = ["umi-fun-cekkontol", "umi-cekkontol", "umi-kontolcheck", "cekkontol", "kontolcheck"]
handler.tags = ["fun"]
handler.description = "Cek ukuran random (bercanda doang)"
handler.importSource = "umi"
handler.importConfig = {"name": "cekkontol", "alias": ["kontolcheck"], "category": "fun", "description": "Cek ukuran random (bercanda doang)", "usage": ".cekkontol <nama>", "example": ".cekkontol Budi", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-fun-cekkontol": "cekkontol", "umi-cekkontol": "cekkontol", "umi-kontolcheck": "kontolcheck", "cekkontol": "cekkontol", "kontolcheck": "kontolcheck"}
export default handler
