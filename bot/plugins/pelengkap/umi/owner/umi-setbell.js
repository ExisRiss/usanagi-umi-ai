import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "setbell", "category": "owner", "aliasMap": {"umi-owner-setbell": "setbell", "umi-setbell": "setbell", "umi-set": "set", "setbell": "setbell", "set": "set"}, "description": "Aktif/nonaktifkan AutoAI Bell berbasis Termai/XTerm", "usage": ".set bell on|off", "example": ".set bell on", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/setbell.js", metadata, m, extra)
handler.help = ["umi-owner-setbell bell on|off"]
handler.command = ["umi-owner-setbell", "umi-setbell", "umi-set", "setbell", "set"]
handler.tags = ["owner"]
handler.description = "Aktif/nonaktifkan AutoAI Bell berbasis Termai/XTerm"
handler.importSource = "umi"
handler.importConfig = {"name": "setbell", "alias": ["set"], "category": "owner", "description": "Aktif/nonaktifkan AutoAI Bell berbasis Termai/XTerm", "usage": ".set bell on|off", "example": ".set bell on", "isOwner": true, "isGroup": true, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-setbell": "setbell", "umi-setbell": "setbell", "umi-set": "set", "setbell": "setbell", "set": "set"}
export default handler
