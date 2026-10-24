import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "ngojek", "category": "rpg", "aliasMap": {"umi-rpg-ngojek": "ngojek", "umi-ngojek": "ngojek", "umi-ojek": "ojek", "umi-gojek": "gojek", "umi-ojol": "ojol", "gojek": "gojek"}, "description": "Ngojek untuk mendapat uang", "usage": ".ngojek", "example": ".ngojek", "cooldown": 120, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/ngojek.js", metadata, m, extra)
handler.help = ["umi-rpg-ngojek"]
handler.command = ["umi-rpg-ngojek", "umi-ngojek", "umi-ojek", "umi-gojek", "umi-ojol", "gojek"]
handler.tags = ["rpg"]
handler.description = "Ngojek untuk mendapat uang"
handler.importSource = "umi"
handler.importConfig = {"name": "ngojek", "alias": ["ojek", "gojek", "ojol"], "category": "rpg", "description": "Ngojek untuk mendapat uang", "usage": ".ngojek", "example": ".ngojek", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 120, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-rpg-ngojek": "ngojek", "umi-ngojek": "ngojek", "umi-ojek": "ojek", "umi-gojek": "gojek", "umi-ojol": "ojol", "gojek": "gojek"}
export default handler
