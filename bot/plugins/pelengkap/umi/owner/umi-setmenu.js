import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "setmenu", "category": "owner", "aliasMap": {"umi-owner-setmenu": "setmenu", "umi-setmenu": "setmenu", "umi-menuvariant": "menuvariant", "umi-menustyle": "menustyle", "menuvariant": "menuvariant", "menustyle": "menustyle"}, "description": "Mengatur variant tampilan menu", "usage": ".setmenu <v1-v9>", "example": ".setmenu v8", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/setmenu.js", metadata, m, extra)
handler.help = ["umi-owner-setmenu <v1-v9>"]
handler.command = ["umi-owner-setmenu", "umi-setmenu", "umi-menuvariant", "umi-menustyle", "menuvariant", "menustyle"]
handler.tags = ["owner"]
handler.description = "Mengatur variant tampilan menu"
handler.importSource = "umi"
handler.importConfig = {"name": "setmenu", "alias": ["menuvariant", "menustyle"], "category": "owner", "description": "Mengatur variant tampilan menu", "usage": ".setmenu <v1-v9>", "example": ".setmenu v8", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-setmenu": "setmenu", "umi-setmenu": "setmenu", "umi-menuvariant": "menuvariant", "umi-menustyle": "menustyle", "menuvariant": "menuvariant", "menustyle": "menustyle"}
export default handler
