/* Ported from ourin; original author credits remain in integrations/ourin/plugins/cek/ceksexy.js. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "ceksexy", "category": "cek", "aliasMap": {"ourin-cek-ceksexy": "ceksexy", "ourin-ceksexy": "ceksexy", "ourin-sexy": "sexy", "ourin-hot": "hot", "hot": "hot"}, "description": "Cek seberapa sexy kamu", "usage": ".ceksexy <nama>", "example": ".ceksexy Budi", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("ourin", "plugins/cek/ceksexy.js", metadata, m, extra)
handler.help = ["ourin-cek-ceksexy <nama>"]
handler.command = ["ourin-cek-ceksexy", "ourin-ceksexy", "ourin-sexy", "ourin-hot", "hot"]
handler.tags = ["cek"]
handler.description = "Cek seberapa sexy kamu"
handler.importSource = "ourin"
handler.importConfig = {"name": "ceksexy", "alias": ["sexy", "hot"], "category": "cek", "description": "Cek seberapa sexy kamu", "usage": ".ceksexy <nama>", "example": ".ceksexy Budi", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"ourin-cek-ceksexy": "ceksexy", "ourin-ceksexy": "ceksexy", "ourin-sexy": "sexy", "ourin-hot": "hot", "hot": "hot"}
export default handler
