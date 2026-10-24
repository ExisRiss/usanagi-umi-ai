import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "dymc", "category": "canvas", "aliasMap": {"umi-canvas-dymc": "dymc", "umi-dymc": "dymc", "umi-dynamiccircular": "dynamiccircular", "dymc": "dymc", "dynamiccircular": "dynamiccircular"}, "description": "Buat gambar dengan efek dynamic circular text", "usage": ".dymc <teks>", "example": ".dymc RIMURU BOT (sambil reply gambar)", "cooldown": 5, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/dymc.js", metadata, m, extra)
handler.help = ["umi-canvas-dymc <teks>"]
handler.command = ["umi-canvas-dymc", "umi-dymc", "umi-dynamiccircular", "dymc", "dynamiccircular"]
handler.tags = ["canvas"]
handler.description = "Buat gambar dengan efek dynamic circular text"
handler.importSource = "umi"
handler.importConfig = {"name": "dymc", "alias": ["dymc", "dynamiccircular"], "category": "canvas", "description": "Buat gambar dengan efek dynamic circular text", "usage": ".dymc <teks>", "example": ".dymc RIMURU BOT (sambil reply gambar)", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-dymc": "dymc", "umi-dymc": "dymc", "umi-dynamiccircular": "dynamiccircular", "dymc": "dymc", "dynamiccircular": "dynamiccircular"}
export default handler
