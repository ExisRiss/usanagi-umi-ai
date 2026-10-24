import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "basket", "category": "canvas", "aliasMap": {"umi-canvas-basket": "basket", "umi-basket": "basket", "basket": "basket"}, "description": "Buat gambar basket dengan nama custom", "usage": ".basket <nama>", "example": ".basket Fauzan", "cooldown": 5, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/basket.js", metadata, m, extra)
handler.help = ["umi-canvas-basket <nama>"]
handler.command = ["umi-canvas-basket", "umi-basket", "basket"]
handler.tags = ["canvas"]
handler.description = "Buat gambar basket dengan nama custom"
handler.importSource = "umi"
handler.importConfig = {"name": "basket", "alias": ["basket"], "category": "canvas", "description": "Buat gambar basket dengan nama custom", "usage": ".basket <nama>", "example": ".basket Fauzan", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-basket": "basket", "umi-basket": "basket", "basket": "basket"}
export default handler
