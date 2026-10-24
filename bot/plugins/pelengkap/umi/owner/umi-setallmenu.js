/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "setallmenu", "category": "owner", "aliasMap": {"umi-owner-setallmenu": "setallmenu", "umi-setallmenu": "setallmenu", "umi-allmenuvariant": "allmenuvariant", "umi-allmenustyle": "allmenustyle", "setallmenu": "setallmenu", "allmenuvariant": "allmenuvariant", "allmenustyle": "allmenustyle"}, "description": "Mengatur variant tampilan allmenu", "usage": ".setallmenu <v1-v9>", "example": ".setallmenu v2", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/setallmenu.js", metadata, m, extra)
handler.help = ["umi-owner-setallmenu <v1-v9>"]
handler.command = ["umi-owner-setallmenu", "umi-setallmenu", "umi-allmenuvariant", "umi-allmenustyle", "setallmenu", "allmenuvariant", "allmenustyle"]
handler.tags = ["owner"]
handler.description = "Mengatur variant tampilan allmenu"
handler.importSource = "umi"
handler.importConfig = {"name": "setallmenu", "alias": ["allmenuvariant", "allmenustyle"], "category": "owner", "description": "Mengatur variant tampilan allmenu", "usage": ".setallmenu <v1-v9>", "example": ".setallmenu v2", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-setallmenu": "setallmenu", "umi-setallmenu": "setallmenu", "umi-allmenuvariant": "allmenuvariant", "umi-allmenustyle": "allmenustyle", "setallmenu": "setallmenu", "allmenuvariant": "allmenuvariant", "allmenustyle": "allmenustyle"}
export default handler
