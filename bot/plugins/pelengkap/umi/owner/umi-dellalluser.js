/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "deluserall", "category": "owner", "aliasMap": {"umi-owner-deluserall": "deluserall", "umi-deluserall": "deluserall", "umi-deletealluser": "deletealluser", "umi-hapussemua": "hapussemua", "umi-delalluser": "delalluser", "umi-resetuser": "resetuser", "umi-clearuser": "clearuser", "deluserall": "deluserall", "deletealluser": "deletealluser", "hapussemua": "hapussemua", "delalluser": "delalluser", "resetuser": "resetuser", "clearuser": "clearuser"}, "description": "Hapus SEMUA user dari database (LANGSUNG HAPUS)", "usage": ".deluserall", "example": ".deluserall", "cooldown": 10}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/dellalluser.js", metadata, m, extra)
handler.help = ["umi-owner-deluserall"]
handler.command = ["umi-owner-deluserall", "umi-deluserall", "umi-deletealluser", "umi-hapussemua", "umi-delalluser", "umi-resetuser", "umi-clearuser", "deluserall", "deletealluser", "hapussemua", "delalluser", "resetuser", "clearuser"]
handler.tags = ["owner"]
handler.description = "Hapus SEMUA user dari database (LANGSUNG HAPUS)"
handler.importSource = "umi"
handler.importConfig = {"name": "deluserall", "alias": ["deletealluser", "hapussemua", "delalluser", "resetuser", "clearuser"], "category": "owner", "description": "Hapus SEMUA user dari database (LANGSUNG HAPUS)", "usage": ".deluserall", "example": ".deluserall", "isOwner": true, "cooldown": 10, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-deluserall": "deluserall", "umi-deluserall": "deluserall", "umi-deletealluser": "deletealluser", "umi-hapussemua": "hapussemua", "umi-delalluser": "delalluser", "umi-resetuser": "resetuser", "umi-clearuser": "clearuser", "deluserall": "deluserall", "deletealluser": "deletealluser", "hapussemua": "hapussemua", "delalluser": "delalluser", "resetuser": "resetuser", "clearuser": "clearuser"}
export default handler
