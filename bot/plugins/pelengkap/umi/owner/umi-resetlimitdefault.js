import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "resetlimitdefault", "category": "owner", "aliasMap": {"umi-owner-resetlimitdefault": "resetlimitdefault", "umi-resetlimitdefault": "resetlimitdefault", "umi-defaultlimitreset": "defaultlimitreset", "resetlimitdefault": "resetlimitdefault", "defaultlimitreset": "defaultlimitreset"}, "description": "Reset default limit ke config asli", "usage": ".resetlimitdefault", "example": ".resetlimitdefault", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/resetlimitdefault.js", metadata, m, extra)
handler.help = ["umi-owner-resetlimitdefault"]
handler.command = ["umi-owner-resetlimitdefault", "umi-resetlimitdefault", "umi-defaultlimitreset", "resetlimitdefault", "defaultlimitreset"]
handler.tags = ["owner"]
handler.description = "Reset default limit ke config asli"
handler.importSource = "umi"
handler.importConfig = {"name": "resetlimitdefault", "alias": ["defaultlimitreset"], "category": "owner", "description": "Reset default limit ke config asli", "usage": ".resetlimitdefault", "example": ".resetlimitdefault", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-resetlimitdefault": "resetlimitdefault", "umi-resetlimitdefault": "resetlimitdefault", "umi-defaultlimitreset": "defaultlimitreset", "resetlimitdefault": "resetlimitdefault", "defaultlimitreset": "defaultlimitreset"}
export default handler
