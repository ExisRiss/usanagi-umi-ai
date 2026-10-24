/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "bmkggempa", "category": "info", "aliasMap": {"umi-info-bmkggempa": "bmkggempa", "umi-bmkggempa": "bmkggempa", "bmkggempa": "bmkggempa"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/info/bmkggempa.js", metadata, m, extra)
handler.help = ["umi-info-bmkggempa"]
handler.command = ["umi-info-bmkggempa", "umi-bmkggempa", "bmkggempa"]
handler.tags = ["info"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "bmkggempa", "alias": [], "category": "info", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-info-bmkggempa": "bmkggempa", "umi-bmkggempa": "bmkggempa", "bmkggempa": "bmkggempa"}
export default handler
