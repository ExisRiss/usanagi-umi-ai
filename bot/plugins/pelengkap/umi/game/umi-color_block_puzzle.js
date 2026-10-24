import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "colorblock", "category": "game", "aliasMap": {"umi-game-colorblock": "colorblock", "umi-colorblock": "colorblock", "umi-colorblockpuzzle": "colorblockpuzzle", "umi-cbp": "cbp", "colorblock": "colorblock", "colorblockpuzzle": "colorblockpuzzle", "cbp": "cbp"}, "description": "Puzzle kotak warna - geser balok kiri/kanan, samakan warna biar hancur!", "usage": "", "example": ".colorblock", "cooldown": 5}
const handler = (m, extra) => runImportedFeature("umi", "plugins/game/color_block_puzzle.js", metadata, m, extra)
handler.help = ["umi-game-colorblock"]
handler.command = ["umi-game-colorblock", "umi-colorblock", "umi-colorblockpuzzle", "umi-cbp", "colorblock", "colorblockpuzzle", "cbp"]
handler.tags = ["game"]
handler.description = "Puzzle kotak warna - geser balok kiri/kanan, samakan warna biar hancur!"
handler.importSource = "umi"
handler.importConfig = {"name": "colorblock", "alias": ["colorblockpuzzle", "cbp"], "category": "game", "description": "Puzzle kotak warna - geser balok kiri/kanan, samakan warna biar hancur!", "usage": "", "example": ".colorblock", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-game-colorblock": "colorblock", "umi-colorblock": "colorblock", "umi-colorblockpuzzle": "colorblockpuzzle", "umi-cbp": "cbp", "colorblock": "colorblock", "colorblockpuzzle": "colorblockpuzzle", "cbp": "cbp"}
export default handler
