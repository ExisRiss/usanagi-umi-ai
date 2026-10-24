import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cecanvietnam", "category": "cecan", "aliasMap": {"umi-cecan-cecanvietnam": "cecanvietnam", "umi-cecanvietnam": "cecanvietnam", "umi-cewekvietnam": "cewekvietnam", "umi-cewekvn": "cewekvn", "cecanvietnam": "cecanvietnam", "cewekvietnam": "cewekvietnam", "cewekvn": "cewekvn"}, "description": "Random gambar cewek cantik Vietnam", "usage": ".cecanvietnam", "example": ".cecanvietnam", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/random/cecanvietnam.js", metadata, m, extra)
handler.help = ["umi-cecan-cecanvietnam"]
handler.command = ["umi-cecan-cecanvietnam", "umi-cecanvietnam", "umi-cewekvietnam", "umi-cewekvn", "cecanvietnam", "cewekvietnam", "cewekvn"]
handler.tags = ["cecan"]
handler.description = "Random gambar cewek cantik Vietnam"
handler.importSource = "umi"
handler.importConfig = {"name": "cecanvietnam", "alias": ["cewekvietnam", "cewekvn"], "category": "cecan", "description": "Random gambar cewek cantik Vietnam", "usage": ".cecanvietnam", "example": ".cecanvietnam", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-cecan-cecanvietnam": "cecanvietnam", "umi-cecanvietnam": "cecanvietnam", "umi-cewekvietnam": "cewekvietnam", "umi-cewekvn": "cewekvn", "cecanvietnam": "cecanvietnam", "cewekvietnam": "cewekvietnam", "cewekvn": "cewekvn"}
export default handler
