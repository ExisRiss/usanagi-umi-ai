/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "savedb", "category": "owner", "aliasMap": {"umi-owner-savedb": "savedb", "umi-savedb": "savedb", "umi-downloaddb": "downloaddb", "umi-getdb": "getdb", "savedb": "savedb", "downloaddb": "downloaddb", "getdb": "getdb"}, "description": "Download file database", "usage": ".savedb", "example": ".savedb", "cooldown": 30, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/savedb.js", metadata, m, extra)
handler.help = ["umi-owner-savedb"]
handler.command = ["umi-owner-savedb", "umi-savedb", "umi-downloaddb", "umi-getdb", "savedb", "downloaddb", "getdb"]
handler.tags = ["owner"]
handler.description = "Download file database"
handler.importSource = "umi"
handler.importConfig = {"name": "savedb", "alias": ["backupdb", "downloaddb", "getdb"], "category": "owner", "description": "Download file database", "usage": ".savedb", "example": ".savedb", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 30, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-savedb": "savedb", "umi-savedb": "savedb", "umi-downloaddb": "downloaddb", "umi-getdb": "getdb", "savedb": "savedb", "downloaddb": "downloaddb", "getdb": "getdb"}
export default handler
