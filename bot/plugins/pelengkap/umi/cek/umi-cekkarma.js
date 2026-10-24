/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cekkarma", "category": "cek", "aliasMap": {"umi-cek-cekkarma": "cekkarma", "umi-cekkarma": "cekkarma", "umi-karma": "karma"}, "description": "Cek tingkat karma kamu", "usage": ".cekkarma <nama>", "example": ".cekkarma Budi", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/cek/cekkarma.js", metadata, m, extra)
handler.help = ["umi-cek-cekkarma <nama>"]
handler.command = ["umi-cek-cekkarma", "umi-cekkarma", "umi-karma"]
handler.tags = ["cek"]
handler.description = "Cek tingkat karma kamu"
handler.importSource = "umi"
handler.importConfig = {"name": "cekkarma", "alias": ["karma"], "category": "cek", "description": "Cek tingkat karma kamu", "usage": ".cekkarma <nama>", "example": ".cekkarma Budi", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-cek-cekkarma": "cekkarma", "umi-cekkarma": "cekkarma", "umi-karma": "karma"}
export default handler
