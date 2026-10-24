/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cekintrovert", "category": "cek", "aliasMap": {"umi-cek-cekintrovert": "cekintrovert", "umi-cekintrovert": "cekintrovert", "umi-introvert": "introvert"}, "description": "Cek tingkat introvert kamu", "usage": ".cekintrovert <nama>", "example": ".cekintrovert Budi", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/cek/cekintrovert.js", metadata, m, extra)
handler.help = ["umi-cek-cekintrovert <nama>"]
handler.command = ["umi-cek-cekintrovert", "umi-cekintrovert", "umi-introvert"]
handler.tags = ["cek"]
handler.description = "Cek tingkat introvert kamu"
handler.importSource = "umi"
handler.importConfig = {"name": "cekintrovert", "alias": ["introvert"], "category": "cek", "description": "Cek tingkat introvert kamu", "usage": ".cekintrovert <nama>", "example": ".cekintrovert Budi", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-cek-cekintrovert": "cekintrovert", "umi-cekintrovert": "cekintrovert", "umi-introvert": "introvert"}
export default handler
