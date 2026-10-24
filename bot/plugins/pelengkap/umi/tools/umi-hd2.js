import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "hd2", "category": "tools", "aliasMap": {"umi-tools-hd2": "hd2", "umi-hd2": "hd2", "umi-enhance2": "enhance2", "umi-upscale2": "upscale2", "umi-aienhancer": "aienhancer"}, "description": "Enhance gambar menjadi HD dengan AI (V3)", "usage": ".hd2 (reply gambar)", "example": ".hd2", "cooldown": 30, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/hd2.js", metadata, m, extra)
handler.help = ["umi-tools-hd2 (reply gambar)"]
handler.command = ["umi-tools-hd2", "umi-hd2", "umi-enhance2", "umi-upscale2", "umi-aienhancer"]
handler.tags = ["tools"]
handler.description = "Enhance gambar menjadi HD dengan AI (V3)"
handler.importSource = "umi"
handler.importConfig = {"name": "hd2", "alias": ["enhance2", "upscale2", "aienhancer"], "category": "tools", "description": "Enhance gambar menjadi HD dengan AI (V3)", "usage": ".hd2 (reply gambar)", "example": ".hd2", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 30, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-tools-hd2": "hd2", "umi-hd2": "hd2", "umi-enhance2": "enhance2", "umi-upscale2": "upscale2", "umi-aienhancer": "aienhancer"}
export default handler
