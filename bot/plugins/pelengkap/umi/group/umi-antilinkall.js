import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "antilinkall", "category": "group", "aliasMap": {"umi-group-antilinkall": "antilinkall", "umi-antilinkall": "antilinkall", "umi-alall": "alall", "umi-antialllink": "antialllink", "antilinkall": "antilinkall", "alall": "alall", "antialllink": "antialllink"}, "description": "Anti semua jenis link (deteksi domain extension)", "usage": ".antilinkall <on/off/metode> [kick/remove]", "example": ".antilinkall on", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/antilinkall.js", metadata, m, extra)
handler.help = ["umi-group-antilinkall <on/off/metode> [kick/remove]"]
handler.command = ["umi-group-antilinkall", "umi-antilinkall", "umi-alall", "umi-antialllink", "antilinkall", "alall", "antialllink"]
handler.tags = ["group"]
handler.description = "Anti semua jenis link (deteksi domain extension)"
handler.importSource = "umi"
handler.importConfig = {"name": "antilinkall", "alias": ["alall", "antialllink"], "category": "group", "description": "Anti semua jenis link (deteksi domain extension)", "usage": ".antilinkall <on/off/metode> [kick/remove]", "example": ".antilinkall on", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true, "isAdmin": true, "isBotAdmin": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = true
handler.botAdmin = true
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-antilinkall": "antilinkall", "umi-antilinkall": "antilinkall", "umi-alall": "alall", "umi-antialllink": "antialllink", "antilinkall": "antilinkall", "alall": "alall", "antialllink": "antialllink"}
export default handler
