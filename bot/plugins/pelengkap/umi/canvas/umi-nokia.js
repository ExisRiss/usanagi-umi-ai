import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "nokia", "category": "canvas", "aliasMap": {"umi-canvas-nokia": "nokia", "umi-nokia": "nokia", "nokia": "nokia"}, "description": "Buat meme nokia", "usage": ".nokia <nama> | <pesan>", "example": ".nokia Bot | Halo dunia", "cooldown": 5, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/nokia.js", metadata, m, extra)
handler.help = ["umi-canvas-nokia <nama> | <pesan>"]
handler.command = ["umi-canvas-nokia", "umi-nokia", "nokia"]
handler.tags = ["canvas"]
handler.description = "Buat meme nokia"
handler.importSource = "umi"
handler.importConfig = {"name": "nokia", "alias": ["nokia"], "category": "canvas", "description": "Buat meme nokia", "usage": ".nokia <nama> | <pesan>", "example": ".nokia Bot | Halo dunia", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-nokia": "nokia", "umi-nokia": "nokia", "nokia": "nokia"}
export default handler
