import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "ttqc", "category": "canvas", "aliasMap": {"umi-canvas-ttqc": "ttqc", "umi-ttqc": "ttqc", "umi-tiktokquote": "tiktokquote", "umi-ttq": "ttq", "tiktokquote": "tiktokquote", "ttq": "ttq"}, "description": "Buat fake quote chat ala TikTok", "usage": ".ttqc <teks> (atau reply teks)", "example": ".ttqc Hallo Dunia", "cooldown": 5, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/ttqc.js", metadata, m, extra)
handler.help = ["umi-canvas-ttqc <teks> (atau reply teks)"]
handler.command = ["umi-canvas-ttqc", "umi-ttqc", "umi-tiktokquote", "umi-ttq", "tiktokquote", "ttq"]
handler.tags = ["canvas"]
handler.description = "Buat fake quote chat ala TikTok"
handler.importSource = "umi"
handler.importConfig = {"name": "ttqc", "alias": ["tiktokquote", "ttq"], "category": "canvas", "description": "Buat fake quote chat ala TikTok", "usage": ".ttqc <teks> (atau reply teks)", "example": ".ttqc Hallo Dunia", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-ttqc": "ttqc", "umi-ttqc": "ttqc", "umi-tiktokquote": "tiktokquote", "umi-ttq": "ttq", "tiktokquote": "tiktokquote", "ttq": "ttq"}
export default handler
