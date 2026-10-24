/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "kematian", "category": "fun", "aliasMap": {"umi-fun-kematian": "kematian", "umi-kematian": "kematian", "kematian": "kematian"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/fun/kematian.js", metadata, m, extra)
handler.help = ["umi-fun-kematian"]
handler.command = ["umi-fun-kematian", "umi-kematian", "kematian"]
handler.tags = ["fun"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "kematian", "alias": [], "category": "fun", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-fun-kematian": "kematian", "umi-kematian": "kematian", "kematian": "kematian"}
export default handler
