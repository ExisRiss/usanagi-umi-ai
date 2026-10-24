import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "remini", "category": "tools", "aliasMap": {"umi-tools-remini": "remini", "umi-remini": "remini", "umi-hd": "hd", "umi-upscale": "upscale"}, "description": "Enhance gambar jadi HD", "usage": ".remini (reply gambar)", "example": ".remini", "cooldown": 15, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/hd.js", metadata, m, extra)
handler.help = ["umi-tools-remini (reply gambar)"]
handler.command = ["umi-tools-remini", "umi-remini", "umi-hd", "umi-upscale"]
handler.tags = ["tools"]
handler.description = "Enhance gambar jadi HD"
handler.importSource = "umi"
handler.importConfig = {"name": "remini", "alias": ["hd", "enhance", "upscale"], "category": "tools", "description": "Enhance gambar jadi HD", "usage": ".remini (reply gambar)", "example": ".remini", "cooldown": 15, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-tools-remini": "remini", "umi-remini": "remini", "umi-hd": "hd", "umi-upscale": "upscale"}
export default handler
