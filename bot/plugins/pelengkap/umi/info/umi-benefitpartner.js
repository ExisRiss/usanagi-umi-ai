import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "benefitpartner", "category": "info", "aliasMap": {"umi-info-benefitpartner": "benefitpartner", "umi-benefitpartner": "benefitpartner", "umi-partnerbenefits": "partnerbenefits", "umi-keuntunganpartner": "keuntunganpartner", "benefitpartner": "benefitpartner", "partnerbenefits": "partnerbenefits", "keuntunganpartner": "keuntunganpartner"}, "description": "Lihat keuntungan menjadi partner bot", "usage": ".benefitpartner", "example": ".benefitpartner", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/info/benefitpartner.js", metadata, m, extra)
handler.help = ["umi-info-benefitpartner"]
handler.command = ["umi-info-benefitpartner", "umi-benefitpartner", "umi-partnerbenefits", "umi-keuntunganpartner", "benefitpartner", "partnerbenefits", "keuntunganpartner"]
handler.tags = ["info"]
handler.description = "Lihat keuntungan menjadi partner bot"
handler.importSource = "umi"
handler.importConfig = {"name": "benefitpartner", "alias": ["partnerbenefits", "keuntunganpartner"], "category": "info", "description": "Lihat keuntungan menjadi partner bot", "usage": ".benefitpartner", "example": ".benefitpartner", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-info-benefitpartner": "benefitpartner", "umi-benefitpartner": "benefitpartner", "umi-partnerbenefits": "partnerbenefits", "umi-keuntunganpartner": "keuntunganpartner", "benefitpartner": "benefitpartner", "partnerbenefits": "partnerbenefits", "keuntunganpartner": "keuntunganpartner"}
export default handler
