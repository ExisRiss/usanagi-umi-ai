/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "antilink", "category": "group", "aliasMap": {"umi-group-antilink": "antilink", "umi-antilink": "antilink", "umi-al": "al", "umi-antilinkgroup": "antilinkgroup", "umi-nolink": "nolink", "al": "al", "antilinkgroup": "antilinkgroup", "nolink": "nolink"}, "description": "Hapus otomatis semua link yang dikirim member grup", "usage": ".antilink <on/off>", "example": ".antilink on", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/antilink.js", metadata, m, extra)
handler.help = ["umi-group-antilink <on/off>"]
handler.command = ["umi-group-antilink", "umi-antilink", "umi-al", "umi-antilinkgroup", "umi-nolink", "al", "antilinkgroup", "nolink"]
handler.tags = ["group"]
handler.description = "Hapus otomatis semua link yang dikirim member grup"
handler.importSource = "umi"
handler.importConfig = {"name": "antilink", "alias": ["al", "antilinkgroup", "nolink"], "category": "group", "description": "Hapus otomatis semua link yang dikirim member grup", "usage": ".antilink <on/off>", "example": ".antilink on", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "isAdmin": true, "isBotAdmin": true, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = true
handler.botAdmin = true
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-antilink": "antilink", "umi-antilink": "antilink", "umi-al": "al", "umi-antilinkgroup": "antilinkgroup", "umi-nolink": "nolink", "al": "al", "antilinkgroup": "antilinkgroup", "nolink": "nolink"}
export default handler
