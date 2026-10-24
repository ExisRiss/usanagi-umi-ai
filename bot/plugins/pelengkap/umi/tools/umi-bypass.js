/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "bypass", "category": "tools", "aliasMap": {"umi-tools-bypass": "bypass", "umi-bypass": "bypass", "umi-linkbypass": "linkbypass", "umi-unlocklink": "unlocklink", "umi-bypasser": "bypasser", "linkbypass": "linkbypass", "unlocklink": "unlocklink", "bypasser": "bypasser"}, "description": "Bypass shortlink / locked URL", "usage": ".bypass <url>", "example": ".bypass sfl.gl/lqOU0", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/bypass.js", metadata, m, extra)
handler.help = ["umi-tools-bypass <url>"]
handler.command = ["umi-tools-bypass", "umi-bypass", "umi-linkbypass", "umi-unlocklink", "umi-bypasser", "linkbypass", "unlocklink", "bypasser"]
handler.tags = ["tools"]
handler.description = "Bypass shortlink / locked URL"
handler.importSource = "umi"
handler.importConfig = {"name": "bypass", "alias": ["linkbypass", "unlocklink", "bypasser"], "category": "tools", "description": "Bypass shortlink / locked URL", "usage": ".bypass <url>", "example": ".bypass sfl.gl/lqOU0", "isOwner": false, "isPremium": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-tools-bypass": "bypass", "umi-bypass": "bypass", "umi-linkbypass": "linkbypass", "umi-unlocklink": "unlocklink", "umi-bypasser": "bypasser", "linkbypass": "linkbypass", "unlocklink": "unlocklink", "bypasser": "bypasser"}
export default handler
