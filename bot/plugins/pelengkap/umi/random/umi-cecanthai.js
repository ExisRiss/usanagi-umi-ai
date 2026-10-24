import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cecanthai", "category": "cecan", "aliasMap": {"umi-cecan-cecanthai": "cecanthai", "umi-cecanthai": "cecanthai", "umi-cewekthai": "cewekthai", "umi-cewekthailand": "cewekthailand", "cecanthai": "cecanthai", "cewekthai": "cewekthai", "cewekthailand": "cewekthailand"}, "description": "Random gambar cewek cantik Thailand", "usage": ".cecanthai", "example": ".cecanthai", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/random/cecanthai.js", metadata, m, extra)
handler.help = ["umi-cecan-cecanthai"]
handler.command = ["umi-cecan-cecanthai", "umi-cecanthai", "umi-cewekthai", "umi-cewekthailand", "cecanthai", "cewekthai", "cewekthailand"]
handler.tags = ["cecan"]
handler.description = "Random gambar cewek cantik Thailand"
handler.importSource = "umi"
handler.importConfig = {"name": "cecanthai", "alias": ["cewekthai", "cewekthailand"], "category": "cecan", "description": "Random gambar cewek cantik Thailand", "usage": ".cecanthai", "example": ".cecanthai", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-cecan-cecanthai": "cecanthai", "umi-cecanthai": "cecanthai", "umi-cewekthai": "cewekthai", "umi-cewekthailand": "cewekthailand", "cecanthai": "cecanthai", "cewekthai": "cewekthai", "cewekthailand": "cewekthailand"}
export default handler
