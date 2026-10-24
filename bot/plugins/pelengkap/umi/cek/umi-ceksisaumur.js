import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "ceksisaumur", "category": "cek", "aliasMap": {"umi-cek-ceksisaumur": "ceksisaumur", "umi-ceksisaumur": "ceksisaumur", "umi-sisaumur": "sisaumur"}, "description": "Cek sisa umur kamu", "usage": ".ceksisaumur <nama>", "example": ".ceksisaumur Budi", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/cek/ceksisaumur.js", metadata, m, extra)
handler.help = ["umi-cek-ceksisaumur <nama>"]
handler.command = ["umi-cek-ceksisaumur", "umi-ceksisaumur", "umi-sisaumur"]
handler.tags = ["cek"]
handler.description = "Cek sisa umur kamu"
handler.importSource = "umi"
handler.importConfig = {"name": "ceksisaumur", "alias": ["sisaumur", "umur"], "category": "cek", "description": "Cek sisa umur kamu", "usage": ".ceksisaumur <nama>", "example": ".ceksisaumur Budi", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-cek-ceksisaumur": "ceksisaumur", "umi-ceksisaumur": "ceksisaumur", "umi-sisaumur": "sisaumur"}
export default handler
