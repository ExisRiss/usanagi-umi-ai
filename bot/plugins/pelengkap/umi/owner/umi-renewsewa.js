/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "renewsewa", "category": "owner", "aliasMap": {"umi-owner-renewsewa": "renewsewa", "umi-renewsewa": "renewsewa", "umi-perpanjangsewa": "perpanjangsewa", "umi-extendsewa": "extendsewa", "renewsewa": "renewsewa", "perpanjangsewa": "perpanjangsewa", "extendsewa": "extendsewa"}, "description": "Perpanjang durasi sewa grup", "usage": ".renewsewa <link/id grup> <durasi>", "example": ".renewsewa https://chat.whatsapp.com/xxx 30d", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/renewsewa.js", metadata, m, extra)
handler.help = ["umi-owner-renewsewa <link/id grup> <durasi>"]
handler.command = ["umi-owner-renewsewa", "umi-renewsewa", "umi-perpanjangsewa", "umi-extendsewa", "renewsewa", "perpanjangsewa", "extendsewa"]
handler.tags = ["owner"]
handler.description = "Perpanjang durasi sewa grup"
handler.importSource = "umi"
handler.importConfig = {"name": "renewsewa", "alias": ["perpanjangsewa", "extendsewa"], "category": "owner", "description": "Perpanjang durasi sewa grup", "usage": ".renewsewa <link/id grup> <durasi>", "example": ".renewsewa https://chat.whatsapp.com/xxx 30d", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-renewsewa": "renewsewa", "umi-renewsewa": "renewsewa", "umi-perpanjangsewa": "perpanjangsewa", "umi-extendsewa": "extendsewa", "renewsewa": "renewsewa", "perpanjangsewa": "perpanjangsewa", "extendsewa": "extendsewa"}
export default handler
