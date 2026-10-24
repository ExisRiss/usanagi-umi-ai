import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "autotyping", "category": "owner", "aliasMap": {"umi-owner-autotyping": "autotyping", "umi-autotyping": "autotyping", "umi-typing": "typing", "umi-autoketik": "autoketik", "autotyping": "autotyping", "typing": "typing", "autoketik": "autoketik"}, "description": "Auto typing indicator saat menerima pesan", "usage": ".autotyping on/off", "example": ".autotyping on", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/autotyping.js", metadata, m, extra)
handler.help = ["umi-owner-autotyping on/off"]
handler.command = ["umi-owner-autotyping", "umi-autotyping", "umi-typing", "umi-autoketik", "autotyping", "typing", "autoketik"]
handler.tags = ["owner"]
handler.description = "Auto typing indicator saat menerima pesan"
handler.importSource = "umi"
handler.importConfig = {"name": "autotyping", "alias": ["typing", "autoketik"], "category": "owner", "description": "Auto typing indicator saat menerima pesan", "usage": ".autotyping on/off", "example": ".autotyping on", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-autotyping": "autotyping", "umi-autotyping": "autotyping", "umi-typing": "typing", "umi-autoketik": "autoketik", "autotyping": "autotyping", "typing": "typing", "autoketik": "autoketik"}
export default handler
