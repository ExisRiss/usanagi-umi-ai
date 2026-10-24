import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cekkepribadian", "category": "cek", "aliasMap": {"umi-cek-cekkepribadian": "cekkepribadian", "umi-cekkepribadian": "cekkepribadian", "umi-kepribadian": "kepribadian", "umi-personality": "personality", "personality": "personality"}, "description": "Cek kepribadian kamu", "usage": ".cekkepribadian <nama>", "example": ".cekkepribadian Budi", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/cek/cekkepribadian.js", metadata, m, extra)
handler.help = ["umi-cek-cekkepribadian <nama>"]
handler.command = ["umi-cek-cekkepribadian", "umi-cekkepribadian", "umi-kepribadian", "umi-personality", "personality"]
handler.tags = ["cek"]
handler.description = "Cek kepribadian kamu"
handler.importSource = "umi"
handler.importConfig = {"name": "cekkepribadian", "alias": ["kepribadian", "personality"], "category": "cek", "description": "Cek kepribadian kamu", "usage": ".cekkepribadian <nama>", "example": ".cekkepribadian Budi", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-cek-cekkepribadian": "cekkepribadian", "umi-cekkepribadian": "cekkepribadian", "umi-kepribadian": "kepribadian", "umi-personality": "personality", "personality": "personality"}
export default handler
