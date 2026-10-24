import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "memorymatch", "category": "game", "aliasMap": {"umi-game-memorymatch": "memorymatch", "umi-memorymatch": "memorymatch", "umi-memorymatchgame": "memorymatchgame", "umi-mmatch": "mmatch", "memorymatch": "memorymatch", "memorymatchgame": "memorymatchgame", "mmatch": "mmatch"}, "description": "Game hafalan kartu - cocokin pasangan emoji!", "usage": "", "example": ".memory", "cooldown": 3}
const handler = (m, extra) => runImportedFeature("umi", "plugins/game/memory_match.js", metadata, m, extra)
handler.help = ["umi-game-memorymatch"]
handler.command = ["umi-game-memorymatch", "umi-memorymatch", "umi-memorymatchgame", "umi-mmatch", "memorymatch", "memorymatchgame", "mmatch"]
handler.tags = ["game"]
handler.description = "Game hafalan kartu - cocokin pasangan emoji!"
handler.importSource = "umi"
handler.importConfig = {"name": "memorymatch", "alias": ["memorymatchgame", "mmatch"], "category": "game", "description": "Game hafalan kartu - cocokin pasangan emoji!", "usage": "", "example": ".memory", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-game-memorymatch": "memorymatch", "umi-memorymatch": "memorymatch", "umi-memorymatchgame": "memorymatchgame", "umi-mmatch": "mmatch", "memorymatch": "memorymatch", "memorymatchgame": "memorymatchgame", "mmatch": "mmatch"}
export default handler
