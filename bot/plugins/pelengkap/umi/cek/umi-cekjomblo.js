/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cekjomblo", "category": "cek", "aliasMap": {"umi-cek-cekjomblo": "cekjomblo", "umi-cekjomblo": "cekjomblo", "umi-jomblo": "jomblo", "umi-single": "single", "single": "single"}, "description": "Cek tingkat kejombloan kamu", "usage": ".cekjomblo <nama>", "example": ".cekjomblo Budi", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/cek/cekjomblo.js", metadata, m, extra)
handler.help = ["umi-cek-cekjomblo <nama>"]
handler.command = ["umi-cek-cekjomblo", "umi-cekjomblo", "umi-jomblo", "umi-single", "single"]
handler.tags = ["cek"]
handler.description = "Cek tingkat kejombloan kamu"
handler.importSource = "umi"
handler.importConfig = {"name": "cekjomblo", "alias": ["jomblo", "single"], "category": "cek", "description": "Cek tingkat kejombloan kamu", "usage": ".cekjomblo <nama>", "example": ".cekjomblo Budi", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-cek-cekjomblo": "cekjomblo", "umi-cekjomblo": "cekjomblo", "umi-jomblo": "jomblo", "umi-single": "single", "single": "single"}
export default handler
