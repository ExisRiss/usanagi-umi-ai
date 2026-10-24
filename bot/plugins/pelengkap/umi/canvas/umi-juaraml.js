import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "juaraml", "category": "canvas", "aliasMap": {"umi-canvas-juaraml": "juaraml", "umi-juaraml": "juaraml", "juaraml": "juaraml"}, "description": "Bikin sertifikat juara Mobile Legends", "usage": ".juaraml <nama>", "example": ".juaraml Fauzan", "cooldown": 5, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/juaraml.js", metadata, m, extra)
handler.help = ["umi-canvas-juaraml <nama>"]
handler.command = ["umi-canvas-juaraml", "umi-juaraml", "juaraml"]
handler.tags = ["canvas"]
handler.description = "Bikin sertifikat juara Mobile Legends"
handler.importSource = "umi"
handler.importConfig = {"name": "juaraml", "alias": [], "category": "canvas", "description": "Bikin sertifikat juara Mobile Legends", "usage": ".juaraml <nama>", "example": ".juaraml Fauzan", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-juaraml": "juaraml", "umi-juaraml": "juaraml", "juaraml": "juaraml"}
export default handler
