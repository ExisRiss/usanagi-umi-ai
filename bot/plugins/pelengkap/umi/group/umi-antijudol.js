/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "antijudol", "category": "group", "aliasMap": {"umi-group-antijudol": "antijudol", "umi-antijudol": "antijudol", "umi-antijudi": "antijudi", "umi-nojudi": "nojudi", "umi-antislot": "antislot", "antijudol": "antijudol", "antijudi": "antijudi", "nojudi": "nojudi", "antislot": "antislot"}, "description": "Deteksi konten judol di grup", "usage": ".antijudol <on/off/metode> [kick/remove]", "example": ".antijudol on", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/antijudol.js", metadata, m, extra)
handler.help = ["umi-group-antijudol <on/off/metode> [kick/remove]"]
handler.command = ["umi-group-antijudol", "umi-antijudol", "umi-antijudi", "umi-nojudi", "umi-antislot", "antijudol", "antijudi", "nojudi", "antislot"]
handler.tags = ["group"]
handler.description = "Deteksi konten judol di grup"
handler.importSource = "umi"
handler.importConfig = {"name": "antijudol", "alias": ["antijudi", "nojudi", "antislot"], "category": "group", "description": "Deteksi konten judol di grup", "usage": ".antijudol <on/off/metode> [kick/remove]", "example": ".antijudol on", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "isAdmin": true, "isBotAdmin": true, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = true
handler.botAdmin = true
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-antijudol": "antijudol", "umi-antijudol": "antijudol", "umi-antijudi": "antijudi", "umi-nojudi": "nojudi", "umi-antislot": "antislot", "antijudol": "antijudol", "antijudi": "antijudi", "nojudi": "nojudi", "antislot": "antislot"}
export default handler
