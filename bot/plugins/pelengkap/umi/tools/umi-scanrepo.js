/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "scanrepo", "category": "tools", "aliasMap": {"umi-tools-scanrepo": "scanrepo", "umi-scanrepo": "scanrepo", "umi-scanrepodev": "scanrepodev", "scanrepo": "scanrepo", "scanrepodev": "scanrepodev"}, "description": "Scan repository GitHub untuk security risk", "usage": ".scanrepo <github-url>", "example": ".scanrepo https://github.com/owner/repo", "cooldown": 30, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/scanrepo.js", metadata, m, extra)
handler.help = ["umi-tools-scanrepo <github-url>"]
handler.command = ["umi-tools-scanrepo", "umi-scanrepo", "umi-scanrepodev", "scanrepo", "scanrepodev"]
handler.tags = ["tools"]
handler.description = "Scan repository GitHub untuk security risk"
handler.importSource = "umi"
handler.importConfig = {"name": "scanrepo", "alias": ["scanrepodev"], "category": "tools", "description": "Scan repository GitHub untuk security risk", "usage": ".scanrepo <github-url>", "example": ".scanrepo https://github.com/owner/repo", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 30, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-tools-scanrepo": "scanrepo", "umi-scanrepo": "scanrepo", "umi-scanrepodev": "scanrepodev", "scanrepo": "scanrepo", "scanrepodev": "scanrepodev"}
export default handler
