import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "sonik", "category": "game", "aliasMap": {"umi-game-sonik": "sonik", "umi-sonik": "sonik", "umi-dash": "dash", "umi-speedy": "speedy", "umi-speeddash": "speeddash"}, "description": "Inline Speedy Dash game", "usage": ".sonik", "example": ".sonik", "cooldown": 1, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/game/sonik.js", metadata, m, extra)
handler.help = ["umi-game-sonik"]
handler.command = ["umi-game-sonik", "umi-sonik", "umi-dash", "umi-speedy", "umi-speeddash"]
handler.tags = ["game"]
handler.description = "Inline Speedy Dash game"
handler.importSource = "umi"
handler.importConfig = {"name": "sonik", "alias": ["dash", "speedy", "speeddash"], "category": "game", "description": "Inline Speedy Dash game", "usage": ".sonik", "example": ".sonik", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 1, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-game-sonik": "sonik", "umi-sonik": "sonik", "umi-dash": "dash", "umi-speedy": "speedy", "umi-speeddash": "speeddash"}
export default handler
