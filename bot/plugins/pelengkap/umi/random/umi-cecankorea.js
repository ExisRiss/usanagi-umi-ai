/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cecankorea", "category": "cecan", "aliasMap": {"umi-cecan-cecankorea": "cecankorea", "umi-cecankorea": "cecankorea", "umi-cewekkorea": "cewekkorea", "umi-cewekkor": "cewekkor", "cecankorea": "cecankorea", "cewekkorea": "cewekkorea", "cewekkor": "cewekkor"}, "description": "Random gambar cewek cantik Korea", "usage": ".cecankorea", "example": ".cecankorea", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/random/cecankorea.js", metadata, m, extra)
handler.help = ["umi-cecan-cecankorea"]
handler.command = ["umi-cecan-cecankorea", "umi-cecankorea", "umi-cewekkorea", "umi-cewekkor", "cecankorea", "cewekkorea", "cewekkor"]
handler.tags = ["cecan"]
handler.description = "Random gambar cewek cantik Korea"
handler.importSource = "umi"
handler.importConfig = {"name": "cecankorea", "alias": ["cewekkorea", "cewekkor"], "category": "cecan", "description": "Random gambar cewek cantik Korea", "usage": ".cecankorea", "example": ".cecankorea", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-cecan-cecankorea": "cecankorea", "umi-cecankorea": "cecankorea", "umi-cewekkorea": "cewekkorea", "umi-cewekkor": "cewekkor", "cecankorea": "cecankorea", "cewekkorea": "cewekkorea", "cewekkor": "cewekkor"}
export default handler
