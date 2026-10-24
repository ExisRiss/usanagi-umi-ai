/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "tembak2", "category": "rpg", "aliasMap": {"umi-rpg-tembak2": "tembak2", "umi-tembak2": "tembak2", "umi-terima2": "terima2", "umi-tolak2": "tolak2", "umi-putus2": "putus2", "umi-pasangan2": "pasangan2", "tembak2": "tembak2", "terima2": "terima2", "tolak2": "tolak2", "putus2": "putus2", "pasangan2": "pasangan2"}, "description": "Fitur hubungan: tembak, terima, tolak, putus, dan cek pasangan", "usage": ".tembak @tag\n.terima\n.tolak\n.putus\n.pasangan", "example": ".tembak @6281234567890", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/jadian2.js", metadata, m, extra)
handler.help = ["umi-rpg-tembak2 @tag\n.terima\n.tolak\n.putus\n.pasangan"]
handler.command = ["umi-rpg-tembak2", "umi-tembak2", "umi-terima2", "umi-tolak2", "umi-putus2", "umi-pasangan2", "tembak2", "terima2", "tolak2", "putus2", "pasangan2"]
handler.tags = ["rpg"]
handler.description = "Fitur hubungan: tembak, terima, tolak, putus, dan cek pasangan"
handler.importSource = "umi"
handler.importConfig = {"name": "tembak2", "alias": ["terima2", "tolak2", "putus2", "pasangan2"], "category": "rpg", "description": "Fitur hubungan: tembak, terima, tolak, putus, dan cek pasangan", "usage": ".tembak @tag\n.terima\n.tolak\n.putus\n.pasangan", "example": ".tembak @6281234567890", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-rpg-tembak2": "tembak2", "umi-tembak2": "tembak2", "umi-terima2": "terima2", "umi-tolak2": "tolak2", "umi-putus2": "putus2", "umi-pasangan2": "pasangan2", "tembak2": "tembak2", "terima2": "terima2", "tolak2": "tolak2", "putus2": "putus2", "pasangan2": "pasangan2"}
export default handler
