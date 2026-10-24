import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "istighfar", "category": "religi", "aliasMap": {"umi-religi-istighfar": "istighfar", "umi-istighfar": "istighfar", "umi-sayyidulistighfar": "sayyidulistighfar", "umi-sayyidul": "sayyidul", "istighfar": "istighfar", "sayyidulistighfar": "sayyidulistighfar", "sayyidul": "sayyidul"}, "description": "Sayyidul Istighfar (Doa Istighfar Terbaik) lengkap Arab, Latin, Arti, dan Keutamaan", "usage": ".istighfar", "example": ".istighfar", "cooldown": 3}
const handler = (m, extra) => runImportedFeature("umi", "plugins/islamic/istighfar.js", metadata, m, extra)
handler.help = ["umi-religi-istighfar"]
handler.command = ["umi-religi-istighfar", "umi-istighfar", "umi-sayyidulistighfar", "umi-sayyidul", "istighfar", "sayyidulistighfar", "sayyidul"]
handler.tags = ["religi"]
handler.description = "Sayyidul Istighfar (Doa Istighfar Terbaik) lengkap Arab, Latin, Arti, dan Keutamaan"
handler.importSource = "umi"
handler.importConfig = {"name": "istighfar", "alias": ["sayyidulistighfar", "istighfar", "sayyidul"], "category": "religi", "description": "Sayyidul Istighfar (Doa Istighfar Terbaik) lengkap Arab, Latin, Arti, dan Keutamaan", "usage": ".istighfar", "example": ".istighfar", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-religi-istighfar": "istighfar", "umi-istighfar": "istighfar", "umi-sayyidulistighfar": "sayyidulistighfar", "umi-sayyidul": "sayyidul", "istighfar": "istighfar", "sayyidulistighfar": "sayyidulistighfar", "sayyidul": "sayyidul"}
export default handler
