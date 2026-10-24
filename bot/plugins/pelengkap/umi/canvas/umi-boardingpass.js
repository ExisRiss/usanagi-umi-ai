import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "boardingpass", "category": "canvas", "aliasMap": {"umi-canvas-boardingpass": "boardingpass", "umi-boardingpass": "boardingpass", "umi-nasapass": "nasapass", "umi-boarding": "boarding", "boardingpass": "boardingpass", "nasapass": "nasapass", "boarding": "boarding"}, "description": "Membuat tiket NASA Boarding Pass kustom", "usage": ".boardingpass <nama>", "example": ".boardingpass Alex", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/boardingpass.js", metadata, m, extra)
handler.help = ["umi-canvas-boardingpass <nama>"]
handler.command = ["umi-canvas-boardingpass", "umi-boardingpass", "umi-nasapass", "umi-boarding", "boardingpass", "nasapass", "boarding"]
handler.tags = ["canvas"]
handler.description = "Membuat tiket NASA Boarding Pass kustom"
handler.importSource = "umi"
handler.importConfig = {"name": "boardingpass", "alias": ["nasapass", "boarding"], "category": "canvas", "description": "Membuat tiket NASA Boarding Pass kustom", "usage": ".boardingpass <nama>", "example": ".boardingpass Alex", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-boardingpass": "boardingpass", "umi-boardingpass": "boardingpass", "umi-nasapass": "nasapass", "umi-boarding": "boarding", "boardingpass": "boardingpass", "nasapass": "nasapass", "boarding": "boarding"}
export default handler
