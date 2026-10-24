import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "balap", "category": "game", "aliasMap": {"umi-game-balap": "balap", "umi-balap": "balap", "umi-racing": "racing", "umi-race": "race", "umi-turborace": "turborace", "balap": "balap", "race": "race", "turborace": "turborace"}, "description": "Game Turbo Race HTML AI Rich.", "usage": ".balap", "example": ".balap", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/game/balap.js", metadata, m, extra)
handler.help = ["umi-game-balap"]
handler.command = ["umi-game-balap", "umi-balap", "umi-racing", "umi-race", "umi-turborace", "balap", "race", "turborace"]
handler.tags = ["game"]
handler.description = "Game Turbo Race HTML AI Rich."
handler.importSource = "umi"
handler.importConfig = {"name": "balap", "alias": ["racing", "race", "turborace"], "category": "game", "description": "Game Turbo Race HTML AI Rich.", "usage": ".balap", "example": ".balap", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-game-balap": "balap", "umi-balap": "balap", "umi-racing": "racing", "umi-race": "race", "umi-turborace": "turborace", "balap": "balap", "race": "race", "turborace": "turborace"}
export default handler
