/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "setownertype", "category": "owner", "aliasMap": {"umi-owner-setownertype": "setownertype", "umi-setownertype": "setownertype", "umi-ownertype": "ownertype", "umi-ownervariant": "ownervariant", "umi-ownerstyle": "ownerstyle", "setownertype": "setownertype", "ownertype": "ownertype", "ownervariant": "ownervariant", "ownerstyle": "ownerstyle"}, "description": "Mengatur variant tampilan owner message", "usage": ".setownertype", "example": ".setownertype", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/setownertype.js", metadata, m, extra)
handler.help = ["umi-owner-setownertype"]
handler.command = ["umi-owner-setownertype", "umi-setownertype", "umi-ownertype", "umi-ownervariant", "umi-ownerstyle", "setownertype", "ownertype", "ownervariant", "ownerstyle"]
handler.tags = ["owner"]
handler.description = "Mengatur variant tampilan owner message"
handler.importSource = "umi"
handler.importConfig = {"name": "setownertype", "alias": ["ownertype", "ownervariant", "ownerstyle"], "category": "owner", "description": "Mengatur variant tampilan owner message", "usage": ".setownertype", "example": ".setownertype", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-setownertype": "setownertype", "umi-setownertype": "setownertype", "umi-ownertype": "ownertype", "umi-ownervariant": "ownervariant", "umi-ownerstyle": "ownerstyle", "setownertype": "setownertype", "ownertype": "ownertype", "ownervariant": "ownervariant", "ownerstyle": "ownerstyle"}
export default handler
