import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cancelorder", "category": "store", "aliasMap": {"umi-store-cancelorder": "cancelorder", "umi-cancelorder": "cancelorder", "umi-batalorder": "batalorder", "umi-batalkanorder": "batalkanorder", "cancelorder": "cancelorder", "batalorder": "batalorder", "batalkanorder": "batalkanorder"}, "description": "Batalkan order", "usage": ".cancelorder <order_id>", "example": ".cancelorder ORD20260111ABC123", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/store/cancelorder.js", metadata, m, extra)
handler.help = ["umi-store-cancelorder <order_id>"]
handler.command = ["umi-store-cancelorder", "umi-cancelorder", "umi-batalorder", "umi-batalkanorder", "cancelorder", "batalorder", "batalkanorder"]
handler.tags = ["store"]
handler.description = "Batalkan order"
handler.importSource = "umi"
handler.importConfig = {"name": "cancelorder", "alias": ["batalorder", "batalkanorder"], "category": "store", "description": "Batalkan order", "usage": ".cancelorder <order_id>", "example": ".cancelorder ORD20260111ABC123", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-store-cancelorder": "cancelorder", "umi-cancelorder": "cancelorder", "umi-batalorder": "batalorder", "umi-batalkanorder": "batalkanorder", "cancelorder": "cancelorder", "batalorder": "batalorder", "batalkanorder": "batalkanorder"}
export default handler
