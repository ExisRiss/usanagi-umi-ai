import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "darkness", "category": "canvas", "aliasMap": {"umi-canvas-darkness": "darkness", "umi-darkness": "darkness", "umi-drakness": "drakness", "darkness": "darkness", "drakness": "drakness"}, "description": "Beri efek gelap pada gambar", "usage": ".darkness [amount]", "example": ".darkness 100 (sambil reply gambar)", "cooldown": 5, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/darkness.js", metadata, m, extra)
handler.help = ["umi-canvas-darkness [amount]"]
handler.command = ["umi-canvas-darkness", "umi-darkness", "umi-drakness", "darkness", "drakness"]
handler.tags = ["canvas"]
handler.description = "Beri efek gelap pada gambar"
handler.importSource = "umi"
handler.importConfig = {"name": "darkness", "alias": ["darkness", "drakness"], "category": "canvas", "description": "Beri efek gelap pada gambar", "usage": ".darkness [amount]", "example": ".darkness 100 (sambil reply gambar)", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-darkness": "darkness", "umi-darkness": "darkness", "umi-drakness": "drakness", "darkness": "darkness", "drakness": "drakness"}
export default handler
