import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cekpartner", "category": "cek", "aliasMap": {"umi-cek-cekpartner": "cekpartner", "umi-cekpartner": "cekpartner", "umi-partnerinfo": "partnerinfo", "partnerinfo": "partnerinfo"}, "description": "Cek detail status partner user", "usage": ".cekpartner @user", "example": ".cekpartner", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/cek/cekpartner.js", metadata, m, extra)
handler.help = ["umi-cek-cekpartner @user"]
handler.command = ["umi-cek-cekpartner", "umi-cekpartner", "umi-partnerinfo", "partnerinfo"]
handler.tags = ["cek"]
handler.description = "Cek detail status partner user"
handler.importSource = "umi"
handler.importConfig = {"name": "cekpartner", "alias": ["partnerinfo"], "category": "cek", "description": "Cek detail status partner user", "usage": ".cekpartner @user", "example": ".cekpartner", "isOwner": false, "isPremium": true, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = true
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-cek-cekpartner": "cekpartner", "umi-cekpartner": "cekpartner", "umi-partnerinfo": "partnerinfo", "partnerinfo": "partnerinfo"}
export default handler
