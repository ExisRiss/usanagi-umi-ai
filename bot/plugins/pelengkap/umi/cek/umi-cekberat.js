/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cekberat", "category": "cek", "aliasMap": {"umi-cek-cekberat": "cekberat", "umi-cekberat": "cekberat", "umi-berat": "berat", "umi-weight": "weight", "weight": "weight"}, "description": "Cek berat badan random", "usage": ".cekberat <nama>", "example": ".cekberat Budi", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/cek/cekberat.js", metadata, m, extra)
handler.help = ["umi-cek-cekberat <nama>"]
handler.command = ["umi-cek-cekberat", "umi-cekberat", "umi-berat", "umi-weight", "weight"]
handler.tags = ["cek"]
handler.description = "Cek berat badan random"
handler.importSource = "umi"
handler.importConfig = {"name": "cekberat", "alias": ["berat", "weight"], "category": "cek", "description": "Cek berat badan random", "usage": ".cekberat <nama>", "example": ".cekberat Budi", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-cek-cekberat": "cekberat", "umi-cekberat": "cekberat", "umi-berat": "berat", "umi-weight": "weight", "weight": "weight"}
export default handler
