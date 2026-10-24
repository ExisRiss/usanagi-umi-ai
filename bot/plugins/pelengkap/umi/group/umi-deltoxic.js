/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "deltoxic", "category": "group", "aliasMap": {"umi-group-deltoxic": "deltoxic", "umi-deltoxic": "deltoxic", "umi-hapustoxic": "hapustoxic", "umi-remtoxic": "remtoxic", "umi-removetoxic": "removetoxic", "deltoxic": "deltoxic", "hapustoxic": "hapustoxic", "remtoxic": "remtoxic", "removetoxic": "removetoxic"}, "description": "Hapus kata toxic dari daftar", "usage": ".deltoxic <kata>", "example": ".deltoxic kata_kasar", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/deltoxic.js", metadata, m, extra)
handler.help = ["umi-group-deltoxic <kata>"]
handler.command = ["umi-group-deltoxic", "umi-deltoxic", "umi-hapustoxic", "umi-remtoxic", "umi-removetoxic", "deltoxic", "hapustoxic", "remtoxic", "removetoxic"]
handler.tags = ["group"]
handler.description = "Hapus kata toxic dari daftar"
handler.importSource = "umi"
handler.importConfig = {"name": "deltoxic", "alias": ["hapustoxic", "remtoxic", "removetoxic"], "category": "group", "description": "Hapus kata toxic dari daftar", "usage": ".deltoxic <kata>", "example": ".deltoxic kata_kasar", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "isAdmin": true, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = true
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-deltoxic": "deltoxic", "umi-deltoxic": "deltoxic", "umi-hapustoxic": "hapustoxic", "umi-remtoxic": "remtoxic", "umi-removetoxic": "removetoxic", "deltoxic": "deltoxic", "hapustoxic": "hapustoxic", "remtoxic": "remtoxic", "removetoxic": "removetoxic"}
export default handler
