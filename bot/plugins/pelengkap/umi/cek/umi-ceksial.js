import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "ceksial", "category": "cek", "aliasMap": {"umi-cek-ceksial": "ceksial", "umi-ceksial": "ceksial", "umi-sial": "sial", "umi-apes": "apes", "apes": "apes"}, "description": "Cek seberapa sial kamu", "usage": ".ceksial <nama>", "example": ".ceksial Budi", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/cek/ceksial.js", metadata, m, extra)
handler.help = ["umi-cek-ceksial <nama>"]
handler.command = ["umi-cek-ceksial", "umi-ceksial", "umi-sial", "umi-apes", "apes"]
handler.tags = ["cek"]
handler.description = "Cek seberapa sial kamu"
handler.importSource = "umi"
handler.importConfig = {"name": "ceksial", "alias": ["sial", "apes"], "category": "cek", "description": "Cek seberapa sial kamu", "usage": ".ceksial <nama>", "example": ".ceksial Budi", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-cek-ceksial": "ceksial", "umi-ceksial": "ceksial", "umi-sial": "sial", "umi-apes": "apes", "apes": "apes"}
export default handler
