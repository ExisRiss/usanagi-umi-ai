/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "onlyadmin", "category": "owner", "aliasMap": {"umi-owner-onlyadmin": "onlyadmin", "umi-onlyadmin": "onlyadmin", "umi-selfadmin": "selfadmin", "umi-publicadmin": "publicadmin", "umi-adminonly": "adminonly", "onlyadmin": "onlyadmin", "selfadmin": "selfadmin", "publicadmin": "publicadmin"}, "description": "Hanya admin grup yang bisa akses command bot", "usage": ".onlyadmin on/off", "example": ".onlyadmin on", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/onlyadmin.js", metadata, m, extra)
handler.help = ["umi-owner-onlyadmin on/off"]
handler.command = ["umi-owner-onlyadmin", "umi-onlyadmin", "umi-selfadmin", "umi-publicadmin", "umi-adminonly", "onlyadmin", "selfadmin", "publicadmin"]
handler.tags = ["owner"]
handler.description = "Hanya admin grup yang bisa akses command bot"
handler.importSource = "umi"
handler.importConfig = {"name": "onlyadmin", "alias": ["selfadmin", "publicadmin", "adminonly"], "category": "owner", "description": "Hanya admin grup yang bisa akses command bot", "usage": ".onlyadmin on/off", "example": ".onlyadmin on", "isOwner": true, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-onlyadmin": "onlyadmin", "umi-onlyadmin": "onlyadmin", "umi-selfadmin": "selfadmin", "umi-publicadmin": "publicadmin", "umi-adminonly": "adminonly", "onlyadmin": "onlyadmin", "selfadmin": "selfadmin", "publicadmin": "publicadmin"}
export default handler
