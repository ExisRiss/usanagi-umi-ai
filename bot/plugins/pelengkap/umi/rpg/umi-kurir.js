import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "kurir", "category": "rpg", "aliasMap": {"umi-rpg-kurir": "kurir", "umi-kurir": "kurir", "umi-antar": "antar", "umi-paket": "paket"}, "description": "Nganter paket orang, awas anjing galak!", "usage": ".kurir", "example": ".kurir", "cooldown": 120, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/kurir.js", metadata, m, extra)
handler.help = ["umi-rpg-kurir"]
handler.command = ["umi-rpg-kurir", "umi-kurir", "umi-antar", "umi-paket"]
handler.tags = ["rpg"]
handler.description = "Nganter paket orang, awas anjing galak!"
handler.importSource = "umi"
handler.importConfig = {"name": "kurir", "alias": ["antar", "paket"], "category": "rpg", "description": "Nganter paket orang, awas anjing galak!", "usage": ".kurir", "example": ".kurir", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 120, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-rpg-kurir": "kurir", "umi-kurir": "kurir", "umi-antar": "antar", "umi-paket": "paket"}
export default handler
