/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "terima", "category": "fun", "aliasMap": {"umi-fun-terima": "terima", "umi-terima": "terima", "umi-accept": "accept", "umi-yes": "yes", "yes": "yes"}, "description": "Menerima tembakan dari seseorang", "usage": ".terima @tag", "example": ".terima @628xxx", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/fun/terima.js", metadata, m, extra)
handler.help = ["umi-fun-terima @tag"]
handler.command = ["umi-fun-terima", "umi-terima", "umi-accept", "umi-yes", "yes"]
handler.tags = ["fun"]
handler.description = "Menerima tembakan dari seseorang"
handler.importSource = "umi"
handler.importConfig = {"name": "terima", "alias": ["accept", "yes"], "category": "fun", "description": "Menerima tembakan dari seseorang", "usage": ".terima @tag", "example": ".terima @628xxx", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-fun-terima": "terima", "umi-terima": "terima", "umi-accept": "accept", "umi-yes": "yes", "yes": "yes"}
export default handler
