/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cecanchina", "category": "cecan", "aliasMap": {"umi-cecan-cecanchina": "cecanchina", "umi-cecanchina": "cecanchina", "umi-cewekchina": "cewekchina", "umi-cewekcina": "cewekcina", "cecanchina": "cecanchina", "cewekchina": "cewekchina", "cewekcina": "cewekcina"}, "description": "Random gambar cewek cantik China", "usage": ".cecanchina", "example": ".cecanchina", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/random/cecanchina.js", metadata, m, extra)
handler.help = ["umi-cecan-cecanchina"]
handler.command = ["umi-cecan-cecanchina", "umi-cecanchina", "umi-cewekchina", "umi-cewekcina", "cecanchina", "cewekchina", "cewekcina"]
handler.tags = ["cecan"]
handler.description = "Random gambar cewek cantik China"
handler.importSource = "umi"
handler.importConfig = {"name": "cecanchina", "alias": ["cewekchina", "cewekcina"], "category": "cecan", "description": "Random gambar cewek cantik China", "usage": ".cecanchina", "example": ".cecanchina", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-cecan-cecanchina": "cecanchina", "umi-cecanchina": "cecanchina", "umi-cewekchina": "cewekchina", "umi-cewekcina": "cewekcina", "cecanchina": "cecanchina", "cewekchina": "cewekchina", "cewekcina": "cewekcina"}
export default handler
