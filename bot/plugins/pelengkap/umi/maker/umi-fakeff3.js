import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "fakeff3", "category": "maker", "aliasMap": {"umi-maker-fakeff3": "fakeff3", "umi-fakeff3": "fakeff3", "umi-fffake3": "fffake3", "umi-fakecardff3": "fakecardff3", "umi-profileff3": "profileff3", "fakeff3": "fakeff3", "fffake3": "fffake3", "fakecardff3": "fakecardff3", "profileff3": "profileff3"}, "description": "Membuat kartu profil/lobby Free Fire palsu (v3)", "usage": ".fakeff3 username|lobby", "example": ".fakeff3 AlwaysCodex|1", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/maker/fakeff3.js", metadata, m, extra)
handler.help = ["umi-maker-fakeff3 username|lobby"]
handler.command = ["umi-maker-fakeff3", "umi-fakeff3", "umi-fffake3", "umi-fakecardff3", "umi-profileff3", "fakeff3", "fffake3", "fakecardff3", "profileff3"]
handler.tags = ["maker"]
handler.description = "Membuat kartu profil/lobby Free Fire palsu (v3)"
handler.importSource = "umi"
handler.importConfig = {"name": "fakeff3", "alias": ["fffake3", "fakecardff3", "profileff3"], "category": "maker", "description": "Membuat kartu profil/lobby Free Fire palsu (v3)", "usage": ".fakeff3 username|lobby", "example": ".fakeff3 AlwaysCodex|1", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-maker-fakeff3": "fakeff3", "umi-fakeff3": "fakeff3", "umi-fffake3": "fffake3", "umi-fakecardff3": "fakecardff3", "umi-profileff3": "profileff3", "fakeff3": "fakeff3", "fffake3": "fffake3", "fakecardff3": "fakecardff3", "profileff3": "profileff3"}
export default handler
