/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "rulesgrup", "category": "group", "aliasMap": {"umi-group-rulesgrup": "rulesgrup", "umi-rulesgrup": "rulesgrup", "umi-grouprules": "grouprules", "umi-aturangrup": "aturangrup", "umi-grules": "grules", "rulesgrup": "rulesgrup", "grouprules": "grouprules", "aturangrup": "aturangrup", "grules": "grules"}, "description": "Menampilkan rules dan aturan grup secara lengkap", "usage": ".rulesgrup", "example": ".rulesgrup", "cooldown": 10, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/rulesgrup.js", metadata, m, extra)
handler.help = ["umi-group-rulesgrup"]
handler.command = ["umi-group-rulesgrup", "umi-rulesgrup", "umi-grouprules", "umi-aturangrup", "umi-grules", "rulesgrup", "grouprules", "aturangrup", "grules"]
handler.tags = ["group"]
handler.description = "Menampilkan rules dan aturan grup secara lengkap"
handler.importSource = "umi"
handler.importConfig = {"name": "rulesgrup", "alias": ["grouprules", "aturangrup", "grules"], "category": "group", "description": "Menampilkan rules dan aturan grup secara lengkap", "usage": ".rulesgrup", "example": ".rulesgrup", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 10, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-rulesgrup": "rulesgrup", "umi-rulesgrup": "rulesgrup", "umi-grouprules": "grouprules", "umi-aturangrup": "aturangrup", "umi-grules": "grules", "rulesgrup": "rulesgrup", "grouprules": "grouprules", "aturangrup": "aturangrup", "grules": "grules"}
export default handler
