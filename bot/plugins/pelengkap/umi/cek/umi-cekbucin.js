/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cekbucin", "category": "cek", "aliasMap": {"umi-cek-cekbucin": "cekbucin", "umi-cekbucin": "cekbucin"}, "description": "Cek seberapa bucin kamu", "usage": ".cekbucin <nama>", "example": ".cekbucin Budi", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/cek/cekbucin.js", metadata, m, extra)
handler.help = ["umi-cek-cekbucin <nama>"]
handler.command = ["umi-cek-cekbucin", "umi-cekbucin"]
handler.tags = ["cek"]
handler.description = "Cek seberapa bucin kamu"
handler.importSource = "umi"
handler.importConfig = {"name": "cekbucin", "alias": ["bucin"], "category": "cek", "description": "Cek seberapa bucin kamu", "usage": ".cekbucin <nama>", "example": ".cekbucin Budi", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-cek-cekbucin": "cekbucin", "umi-cekbucin": "cekbucin"}
export default handler
