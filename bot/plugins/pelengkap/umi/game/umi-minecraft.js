/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "mct", "category": "game", "aliasMap": {"umi-game-mct": "mct", "umi-mct": "mct", "umi-minecraft": "minecraft", "mct": "mct", "minecraft": "minecraft"}, "description": "Minecraft - Mining & Crafting Game", "usage": ".mct <command>", "example": ".mct help", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/game/minecraft.js", metadata, m, extra)
handler.help = ["umi-game-mct <command>"]
handler.command = ["umi-game-mct", "umi-mct", "umi-minecraft", "mct", "minecraft"]
handler.tags = ["game"]
handler.description = "Minecraft - Mining & Crafting Game"
handler.importSource = "umi"
handler.importConfig = {"name": "mct", "alias": ["minecraft"], "category": "game", "description": "Minecraft - Mining & Crafting Game", "usage": ".mct <command>", "example": ".mct help", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-game-mct": "mct", "umi-mct": "mct", "umi-minecraft": "minecraft", "mct": "mct", "minecraft": "minecraft"}
export default handler
