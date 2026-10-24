import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cecanindo", "category": "cecan", "aliasMap": {"umi-cecan-cecanindo": "cecanindo", "umi-cecanindo": "cecanindo", "umi-cewekindo": "cewekindo", "umi-cewekindonesia": "cewekindonesia", "cecanindo": "cecanindo", "cewekindo": "cewekindo", "cewekindonesia": "cewekindonesia"}, "description": "Random gambar cewek cantik Indonesia", "usage": ".cecanindo", "example": ".cecanindo", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/random/cecanindo.js", metadata, m, extra)
handler.help = ["umi-cecan-cecanindo"]
handler.command = ["umi-cecan-cecanindo", "umi-cecanindo", "umi-cewekindo", "umi-cewekindonesia", "cecanindo", "cewekindo", "cewekindonesia"]
handler.tags = ["cecan"]
handler.description = "Random gambar cewek cantik Indonesia"
handler.importSource = "umi"
handler.importConfig = {"name": "cecanindo", "alias": ["cewekindo", "cewekindonesia"], "category": "cecan", "description": "Random gambar cewek cantik Indonesia", "usage": ".cecanindo", "example": ".cecanindo", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-cecan-cecanindo": "cecanindo", "umi-cecanindo": "cecanindo", "umi-cewekindo": "cewekindo", "umi-cewekindonesia": "cewekindonesia", "cecanindo": "cecanindo", "cewekindo": "cewekindo", "cewekindonesia": "cewekindonesia"}
export default handler
