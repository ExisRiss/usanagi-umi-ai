import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "afinitasml", "category": "canvas", "aliasMap": {"umi-canvas-afinitasml": "afinitasml", "umi-afinitasml": "afinitasml", "umi-afinitas": "afinitas", "umi-mlafinitas": "mlafinitas", "afinitasml": "afinitasml", "afinitas": "afinitas", "mlafinitas": "mlafinitas"}, "description": "Bikin card afinitas ML dari fotomu", "usage": ".afinitasml (reply/kirim foto) [bgNum]", "example": ".afinitasml 2", "cooldown": 5, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/afinitasml.js", metadata, m, extra)
handler.help = ["umi-canvas-afinitasml (reply/kirim foto) [bgNum]"]
handler.command = ["umi-canvas-afinitasml", "umi-afinitasml", "umi-afinitas", "umi-mlafinitas", "afinitasml", "afinitas", "mlafinitas"]
handler.tags = ["canvas"]
handler.description = "Bikin card afinitas ML dari fotomu"
handler.importSource = "umi"
handler.importConfig = {"name": "afinitasml", "alias": ["afinitas", "mlafinitas"], "category": "canvas", "description": "Bikin card afinitas ML dari fotomu", "usage": ".afinitasml (reply/kirim foto) [bgNum]", "example": ".afinitasml 2", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-afinitasml": "afinitasml", "umi-afinitasml": "afinitasml", "umi-afinitas": "afinitas", "umi-mlafinitas": "mlafinitas", "afinitasml": "afinitasml", "afinitas": "afinitas", "mlafinitas": "mlafinitas"}
export default handler
