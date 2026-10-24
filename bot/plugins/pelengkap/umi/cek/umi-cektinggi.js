import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cektinggi", "category": "cek", "aliasMap": {"umi-cek-cektinggi": "cektinggi", "umi-cektinggi": "cektinggi", "umi-tinggi": "tinggi", "umi-tall": "tall", "tall": "tall"}, "description": "Cek tinggi badan random", "usage": ".cektinggi <nama>", "example": ".cektinggi Budi", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/cek/cektinggi.js", metadata, m, extra)
handler.help = ["umi-cek-cektinggi <nama>"]
handler.command = ["umi-cek-cektinggi", "umi-cektinggi", "umi-tinggi", "umi-tall", "tall"]
handler.tags = ["cek"]
handler.description = "Cek tinggi badan random"
handler.importSource = "umi"
handler.importConfig = {"name": "cektinggi", "alias": ["tinggi", "tall"], "category": "cek", "description": "Cek tinggi badan random", "usage": ".cektinggi <nama>", "example": ".cektinggi Budi", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-cek-cektinggi": "cektinggi", "umi-cektinggi": "cektinggi", "umi-tinggi": "tinggi", "umi-tall": "tall", "tall": "tall"}
export default handler
