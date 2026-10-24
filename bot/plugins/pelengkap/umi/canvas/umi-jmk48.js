import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "jmk48", "category": "canvas", "aliasMap": {"umi-canvas-jmk48": "jmk48", "umi-jmk48": "jmk48", "jmk48": "jmk48"}, "description": "Bikin gambarmu jadi member JMK48", "usage": ".jmk48 (reply/kirim foto)", "example": ".jmk48", "cooldown": 5, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/jmk48.js", metadata, m, extra)
handler.help = ["umi-canvas-jmk48 (reply/kirim foto)"]
handler.command = ["umi-canvas-jmk48", "umi-jmk48", "jmk48"]
handler.tags = ["canvas"]
handler.description = "Bikin gambarmu jadi member JMK48"
handler.importSource = "umi"
handler.importConfig = {"name": "jmk48", "alias": [], "category": "canvas", "description": "Bikin gambarmu jadi member JMK48", "usage": ".jmk48 (reply/kirim foto)", "example": ".jmk48", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-jmk48": "jmk48", "umi-jmk48": "jmk48", "jmk48": "jmk48"}
export default handler
