import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "img2ios", "category": "canvas", "aliasMap": {"umi-canvas-img2ios": "img2ios", "umi-img2ios": "img2ios", "umi-toios": "toios", "img2ios": "img2ios", "toios": "toios"}, "description": "Bikin gambarmu menjadi gaya foto iOS", "usage": ".img2ios (reply/kirim foto)", "example": ".img2ios", "cooldown": 5, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/img2ios.js", metadata, m, extra)
handler.help = ["umi-canvas-img2ios (reply/kirim foto)"]
handler.command = ["umi-canvas-img2ios", "umi-img2ios", "umi-toios", "img2ios", "toios"]
handler.tags = ["canvas"]
handler.description = "Bikin gambarmu menjadi gaya foto iOS"
handler.importSource = "umi"
handler.importConfig = {"name": "img2ios", "alias": ["toios"], "category": "canvas", "description": "Bikin gambarmu menjadi gaya foto iOS", "usage": ".img2ios (reply/kirim foto)", "example": ".img2ios", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-img2ios": "img2ios", "umi-img2ios": "img2ios", "umi-toios": "toios", "img2ios": "img2ios", "toios": "toios"}
export default handler
