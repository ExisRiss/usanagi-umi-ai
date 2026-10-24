/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "speedydash", "category": "game", "aliasMap": {"umi-game-speedydash": "speedydash", "umi-speedydash": "speedydash", "umi-speedydashgame": "speedydashgame", "speedydash": "speedydash", "speedydashgame": "speedydashgame"}, "description": "Main game endless runner Speedy Dash langsung di chat, kumpulin ring dan hindari musuh", "usage": "", "example": ".dash", "cooldown": 5}
const handler = (m, extra) => runImportedFeature("umi", "plugins/game/speedydash.js", metadata, m, extra)
handler.help = ["umi-game-speedydash"]
handler.command = ["umi-game-speedydash", "umi-speedydash", "umi-speedydashgame", "speedydash", "speedydashgame"]
handler.tags = ["game"]
handler.description = "Main game endless runner Speedy Dash langsung di chat, kumpulin ring dan hindari musuh"
handler.importSource = "umi"
handler.importConfig = {"name": "speedydash", "alias": ["speedydashgame"], "category": "game", "description": "Main game endless runner Speedy Dash langsung di chat, kumpulin ring dan hindari musuh", "usage": "", "example": ".dash", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-game-speedydash": "speedydash", "umi-speedydash": "speedydash", "umi-speedydashgame": "speedydashgame", "speedydash": "speedydash", "speedydashgame": "speedydashgame"}
export default handler
