/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "tolak", "category": "fun", "aliasMap": {"umi-fun-tolak": "tolak", "umi-tolak": "tolak", "umi-reject": "reject", "umi-no": "no", "umi-gaktau": "gaktau", "no": "no", "gaktau": "gaktau"}, "description": "Menolak tembakan dari seseorang", "usage": ".tolak @tag", "example": ".tolak @628xxx", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/fun/tolak.js", metadata, m, extra)
handler.help = ["umi-fun-tolak @tag"]
handler.command = ["umi-fun-tolak", "umi-tolak", "umi-reject", "umi-no", "umi-gaktau", "no", "gaktau"]
handler.tags = ["fun"]
handler.description = "Menolak tembakan dari seseorang"
handler.importSource = "umi"
handler.importConfig = {"name": "tolak", "alias": ["reject", "no", "gaktau"], "category": "fun", "description": "Menolak tembakan dari seseorang", "usage": ".tolak @tag", "example": ".tolak @628xxx", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-fun-tolak": "tolak", "umi-tolak": "tolak", "umi-reject": "reject", "umi-no": "no", "umi-gaktau": "gaktau", "no": "no", "gaktau": "gaktau"}
export default handler
