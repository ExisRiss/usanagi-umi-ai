import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cekhoki", "category": "cek", "aliasMap": {"umi-cek-cekhoki": "cekhoki", "umi-cekhoki": "cekhoki", "umi-hoki": "hoki", "lucky": "lucky"}, "description": "Cek seberapa hoki kamu", "usage": ".cekhoki <nama>", "example": ".cekhoki Budi", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/cek/cekhoki.js", metadata, m, extra)
handler.help = ["umi-cek-cekhoki <nama>"]
handler.command = ["umi-cek-cekhoki", "umi-cekhoki", "umi-hoki", "lucky"]
handler.tags = ["cek"]
handler.description = "Cek seberapa hoki kamu"
handler.importSource = "umi"
handler.importConfig = {"name": "cekhoki", "alias": ["hoki", "lucky"], "category": "cek", "description": "Cek seberapa hoki kamu", "usage": ".cekhoki <nama>", "example": ".cekhoki Budi", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-cek-cekhoki": "cekhoki", "umi-cekhoki": "cekhoki", "umi-hoki": "hoki", "lucky": "lucky"}
export default handler
