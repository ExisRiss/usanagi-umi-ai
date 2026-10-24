/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "benarkah", "category": "fun", "aliasMap": {"umi-fun-benarkah": "benarkah", "umi-benarkah": "benarkah", "benarkah": "benarkah"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/fun/benarkah.js", metadata, m, extra)
handler.help = ["umi-fun-benarkah"]
handler.command = ["umi-fun-benarkah", "umi-benarkah", "benarkah"]
handler.tags = ["fun"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "benarkah", "alias": [], "category": "fun", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-fun-benarkah": "benarkah", "umi-benarkah": "benarkah", "benarkah": "benarkah"}
export default handler
