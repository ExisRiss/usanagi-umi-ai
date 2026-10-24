/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "wwprotect", "category": "game", "aliasMap": {"umi-game-wwprotect": "wwprotect", "umi-wwprotect": "wwprotect", "umi-protect": "protect", "umi-guardian": "guardian", "umi-wpr": "wpr", "wwprotect": "wwprotect", "protect": "protect", "guardian": "guardian", "wpr": "wpr"}, "description": "Guardian night action - Protect target", "usage": ".wwprotect <nomor>", "example": ".wwprotect 3", "cooldown": 0, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/game/wwprotect.js", metadata, m, extra)
handler.help = ["umi-game-wwprotect <nomor>"]
handler.command = ["umi-game-wwprotect", "umi-wwprotect", "umi-protect", "umi-guardian", "umi-wpr", "wwprotect", "protect", "guardian", "wpr"]
handler.tags = ["game"]
handler.description = "Guardian night action - Protect target"
handler.importSource = "umi"
handler.importConfig = {"name": "wwprotect", "alias": ["protect", "guardian", "wpr"], "category": "game", "description": "Guardian night action - Protect target", "usage": ".wwprotect <nomor>", "example": ".wwprotect 3", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": true, "cooldown": 0, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = true
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-game-wwprotect": "wwprotect", "umi-wwprotect": "wwprotect", "umi-protect": "protect", "umi-guardian": "guardian", "umi-wpr": "wpr", "wwprotect": "wwprotect", "protect": "protect", "guardian": "guardian", "wpr": "wpr"}
export default handler
