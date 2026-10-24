/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cekcupu", "category": "cek", "aliasMap": {"umi-cek-cekcupu": "cekcupu", "umi-cekcupu": "cekcupu", "umi-cupu": "cupu", "umi-noob": "noob"}, "description": "Cek tingkat kecupuan kamu", "usage": ".cekcupu <nama>", "example": ".cekcupu Budi", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/cek/cekcupu.js", metadata, m, extra)
handler.help = ["umi-cek-cekcupu <nama>"]
handler.command = ["umi-cek-cekcupu", "umi-cekcupu", "umi-cupu", "umi-noob"]
handler.tags = ["cek"]
handler.description = "Cek tingkat kecupuan kamu"
handler.importSource = "umi"
handler.importConfig = {"name": "cekcupu", "alias": ["cupu", "noob"], "category": "cek", "description": "Cek tingkat kecupuan kamu", "usage": ".cekcupu <nama>", "example": ".cekcupu Budi", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-cek-cekcupu": "cekcupu", "umi-cekcupu": "cekcupu", "umi-cupu": "cupu", "umi-noob": "noob"}
export default handler
