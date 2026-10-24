/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "pacman", "category": "game", "aliasMap": {"umi-game-pacman": "pacman", "umi-pacman": "pacman", "umi-pac": "pac", "pacman": "pacman", "pac": "pac"}, "description": "Pac-Man classic - makan titik & hindari hantu!", "usage": "", "example": ".pacman", "cooldown": 5}
const handler = (m, extra) => runImportedFeature("umi", "plugins/game/pac_man.js", metadata, m, extra)
handler.help = ["umi-game-pacman"]
handler.command = ["umi-game-pacman", "umi-pacman", "umi-pac", "pacman", "pac"]
handler.tags = ["game"]
handler.description = "Pac-Man classic - makan titik & hindari hantu!"
handler.importSource = "umi"
handler.importConfig = {"name": "pacman", "alias": ["pac"], "category": "game", "description": "Pac-Man classic - makan titik & hindari hantu!", "usage": "", "example": ".pacman", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-game-pacman": "pacman", "umi-pacman": "pacman", "umi-pac": "pac", "pacman": "pacman", "pac": "pac"}
export default handler
