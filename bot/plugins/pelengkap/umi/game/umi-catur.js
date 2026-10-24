import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "catur", "category": "game", "aliasMap": {"umi-game-catur": "catur", "umi-catur": "catur", "umi-chess": "chess", "umi-caturn": "caturn", "umi-rcatur": "rcatur", "caturn": "caturn", "rcatur": "rcatur"}, "description": "Inline Chess game", "usage": ".catur", "example": ".catur", "cooldown": 1, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/game/catur.js", metadata, m, extra)
handler.help = ["umi-game-catur"]
handler.command = ["umi-game-catur", "umi-catur", "umi-chess", "umi-caturn", "umi-rcatur", "caturn", "rcatur"]
handler.tags = ["game"]
handler.description = "Inline Chess game"
handler.importSource = "umi"
handler.importConfig = {"name": "catur", "alias": ["chess", "caturn", "rcatur"], "category": "game", "description": "Inline Chess game", "usage": ".catur", "example": ".catur", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 1, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-game-catur": "catur", "umi-catur": "catur", "umi-chess": "chess", "umi-caturn": "caturn", "umi-rcatur": "rcatur", "caturn": "caturn", "rcatur": "rcatur"}
export default handler
