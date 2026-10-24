/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "addtoxic", "category": "group", "aliasMap": {"umi-group-addtoxic": "addtoxic", "umi-addtoxic": "addtoxic", "umi-tambahtoxic": "tambahtoxic", "umi-addkata": "addkata", "addtoxic": "addtoxic", "tambahtoxic": "tambahtoxic", "addkata": "addkata"}, "description": "Tambah kata toxic ke daftar", "usage": ".addtoxic <kata>", "example": ".addtoxic kata_kasar", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/addtoxic.js", metadata, m, extra)
handler.help = ["umi-group-addtoxic <kata>"]
handler.command = ["umi-group-addtoxic", "umi-addtoxic", "umi-tambahtoxic", "umi-addkata", "addtoxic", "tambahtoxic", "addkata"]
handler.tags = ["group"]
handler.description = "Tambah kata toxic ke daftar"
handler.importSource = "umi"
handler.importConfig = {"name": "addtoxic", "alias": ["tambahtoxic", "addkata"], "category": "group", "description": "Tambah kata toxic ke daftar", "usage": ".addtoxic <kata>", "example": ".addtoxic kata_kasar", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "isAdmin": true, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = true
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-addtoxic": "addtoxic", "umi-addtoxic": "addtoxic", "umi-tambahtoxic": "tambahtoxic", "umi-addkata": "addkata", "addtoxic": "addtoxic", "tambahtoxic": "tambahtoxic", "addkata": "addkata"}
export default handler
