/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cekprocastinator", "category": "cek", "aliasMap": {"umi-cek-cekprocastinator": "cekprocastinator", "umi-cekprocastinator": "cekprocastinator", "umi-procrastinator": "procrastinator", "umi-nunda": "nunda", "nunda": "nunda"}, "description": "Cek tingkat suka menunda", "usage": ".cekprocastinator <nama>", "example": ".cekprocastinator Budi", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/cek/cekprocastinator.js", metadata, m, extra)
handler.help = ["umi-cek-cekprocastinator <nama>"]
handler.command = ["umi-cek-cekprocastinator", "umi-cekprocastinator", "umi-procrastinator", "umi-nunda", "nunda"]
handler.tags = ["cek"]
handler.description = "Cek tingkat suka menunda"
handler.importSource = "umi"
handler.importConfig = {"name": "cekprocastinator", "alias": ["procrastinator", "nunda"], "category": "cek", "description": "Cek tingkat suka menunda", "usage": ".cekprocastinator <nama>", "example": ".cekprocastinator Budi", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-cek-cekprocastinator": "cekprocastinator", "umi-cekprocastinator": "cekprocastinator", "umi-procrastinator": "procrastinator", "umi-nunda": "nunda", "nunda": "nunda"}
export default handler
