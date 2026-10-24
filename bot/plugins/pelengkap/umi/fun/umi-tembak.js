/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "tembak", "category": "fun", "aliasMap": {"umi-fun-tembak": "tembak", "umi-tembak": "tembak", "umi-nembak": "nembak"}, "description": "Menembak seseorang untuk pacaran", "usage": ".tembak @tag", "example": ".tembak @628xxx", "cooldown": 30, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/fun/tembak.js", metadata, m, extra)
handler.help = ["umi-fun-tembak @tag"]
handler.command = ["umi-fun-tembak", "umi-tembak", "umi-nembak"]
handler.tags = ["fun"]
handler.description = "Menembak seseorang untuk pacaran"
handler.importSource = "umi"
handler.importConfig = {"name": "tembak", "alias": ["nembak", "propose"], "category": "fun", "description": "Menembak seseorang untuk pacaran", "usage": ".tembak @tag", "example": ".tembak @628xxx", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 30, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-fun-tembak": "tembak", "umi-tembak": "tembak", "umi-nembak": "nembak"}
export default handler
