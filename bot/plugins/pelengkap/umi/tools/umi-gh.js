/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "ghuser", "category": "tools", "aliasMap": {"umi-tools-ghuser": "ghuser", "umi-ghuser": "ghuser", "umi-ghsearch": "ghsearch", "umi-ghgist": "ghgist", "ghuser": "ghuser", "ghsearch": "ghsearch", "ghgist": "ghgist"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/gh.js", metadata, m, extra)
handler.help = ["umi-tools-ghuser"]
handler.command = ["umi-tools-ghuser", "umi-ghuser", "umi-ghsearch", "umi-ghgist", "ghuser", "ghsearch", "ghgist"]
handler.tags = ["tools"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "ghuser", "alias": ["ghsearch", "ghgist"], "category": "tools", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-tools-ghuser": "ghuser", "umi-ghuser": "ghuser", "umi-ghsearch": "ghsearch", "umi-ghgist": "ghgist", "ghuser": "ghuser", "ghsearch": "ghsearch", "ghgist": "ghgist"}
export default handler
