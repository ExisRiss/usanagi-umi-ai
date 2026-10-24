/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "lupakan", "category": "fun", "aliasMap": {"umi-fun-lupakan": "lupakan", "umi-lupakan": "lupakan", "lupakan": "lupakan"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/fun/lupakan.js", metadata, m, extra)
handler.help = ["umi-fun-lupakan"]
handler.command = ["umi-fun-lupakan", "umi-lupakan", "lupakan"]
handler.tags = ["fun"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "lupakan", "alias": [], "category": "fun", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-fun-lupakan": "lupakan", "umi-lupakan": "lupakan", "lupakan": "lupakan"}
export default handler
