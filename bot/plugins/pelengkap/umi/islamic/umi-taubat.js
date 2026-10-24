import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "taubat", "category": "religi", "aliasMap": {"umi-religi-taubat": "taubat", "umi-taubat": "taubat", "umi-taubatnasuha": "taubatnasuha", "umi-taubat-nasuha": "taubat-nasuha", "umi-doataubat": "doataubat", "taubat": "taubat", "taubatnasuha": "taubatnasuha", "taubat-nasuha": "taubat-nasuha", "doataubat": "doataubat"}, "description": "Panduan taubat nasuha lengkap dengan doa, latin, arti, dan tata caranya", "usage": ".taubat", "example": ".taubat", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/islamic/taubat.js", metadata, m, extra)
handler.help = ["umi-religi-taubat"]
handler.command = ["umi-religi-taubat", "umi-taubat", "umi-taubatnasuha", "umi-taubat-nasuha", "umi-doataubat", "taubat", "taubatnasuha", "taubat-nasuha", "doataubat"]
handler.tags = ["religi"]
handler.description = "Panduan taubat nasuha lengkap dengan doa, latin, arti, dan tata caranya"
handler.importSource = "umi"
handler.importConfig = {"name": "taubat", "alias": ["taubatnasuha", "taubat-nasuha", "doataubat"], "category": "religi", "description": "Panduan taubat nasuha lengkap dengan doa, latin, arti, dan tata caranya", "usage": ".taubat", "example": ".taubat", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-religi-taubat": "taubat", "umi-taubat": "taubat", "umi-taubatnasuha": "taubatnasuha", "umi-taubat-nasuha": "taubat-nasuha", "umi-doataubat": "doataubat", "taubat": "taubat", "taubatnasuha": "taubatnasuha", "taubat-nasuha": "taubat-nasuha", "doataubat": "doataubat"}
export default handler
