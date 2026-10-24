import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "backupdb", "category": "owner", "aliasMap": {"umi-owner-backupdb": "backupdb", "umi-dbbackup": "dbbackup", "umi-backupstore": "backupstore", "umi-storebackup": "storebackup", "backupdb": "backupdb", "dbbackup": "dbbackup", "backupstore": "backupstore", "storebackup": "storebackup"}, "description": "Backup database/store dan kirim ke owner", "usage": ".backupdb"}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/backupdb.js", metadata, m, extra)
handler.help = ["umi-owner-backupdb"]
handler.command = ["umi-owner-backupdb", "umi-dbbackup", "umi-backupstore", "umi-storebackup", "backupdb", "dbbackup", "backupstore", "storebackup"]
handler.tags = ["owner"]
handler.description = "Backup database/store dan kirim ke owner"
handler.importSource = "umi"
handler.importConfig = {"name": "backupdb", "alias": ["dbbackup", "backupstore", "storebackup"], "category": "owner", "description": "Backup database/store dan kirim ke owner", "usage": ".backupdb", "isOwner": true, "isGroup": false, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-backupdb": "backupdb", "umi-dbbackup": "dbbackup", "umi-backupstore": "backupstore", "umi-storebackup": "storebackup", "backupdb": "backupdb", "dbbackup": "dbbackup", "backupstore": "backupstore", "storebackup": "storebackup"}
export default handler
