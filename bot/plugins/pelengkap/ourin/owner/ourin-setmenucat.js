/* Ported from ourin; original author credits remain in integrations/ourin/plugins/owner/setmenucat.js. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "setmenucat", "category": "owner", "aliasMap": {"ourin-owner-setmenucat": "setmenucat", "ourin-setmenucat": "setmenucat", "ourin-menucatvariant": "menucatvariant", "ourin-menucatstyle": "menucatstyle", "setmenucat": "setmenucat", "menucatvariant": "menucatvariant", "menucatstyle": "menucatstyle"}, "description": "Mengatur variant tampilan menucat", "usage": ".setmenucat <v1-v2, v5>", "example": ".setmenucat v2", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("ourin", "plugins/owner/setmenucat.js", metadata, m, extra)
handler.help = ["ourin-owner-setmenucat <v1-v2, v5>"]
handler.command = ["ourin-owner-setmenucat", "ourin-setmenucat", "ourin-menucatvariant", "ourin-menucatstyle", "setmenucat", "menucatvariant", "menucatstyle"]
handler.tags = ["owner"]
handler.description = "Mengatur variant tampilan menucat"
handler.importSource = "ourin"
handler.importConfig = {"name": "setmenucat", "alias": ["menucatvariant", "menucatstyle"], "category": "owner", "description": "Mengatur variant tampilan menucat", "usage": ".setmenucat <v1-v2, v5>", "example": ".setmenucat v2", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"ourin-owner-setmenucat": "setmenucat", "ourin-setmenucat": "setmenucat", "ourin-menucatvariant": "menucatvariant", "ourin-menucatstyle": "menucatstyle", "setmenucat": "setmenucat", "menucatvariant": "menucatvariant", "menucatstyle": "menucatstyle"}
export default handler
