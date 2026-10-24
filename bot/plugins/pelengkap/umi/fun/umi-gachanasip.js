import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "gachanasip", "category": "fun", "aliasMap": {"umi-fun-gachanasip": "gachanasip", "umi-gachanasip": "gachanasip", "gachanasip": "gachanasip"}, "description": "Random nasip / hoki / keberuntungan buat user", "usage": ".gachanasip"}
const handler = (m, extra) => runImportedFeature("umi", "plugins/fun/gachanasip.js", metadata, m, extra)
handler.help = ["umi-fun-gachanasip"]
handler.command = ["umi-fun-gachanasip", "umi-gachanasip", "gachanasip"]
handler.tags = ["fun"]
handler.description = "Random nasip / hoki / keberuntungan buat user"
handler.importSource = "umi"
handler.importConfig = {"name": "gachanasip", "category": "fun", "description": "Random nasip / hoki / keberuntungan buat user", "usage": ".gachanasip", "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-fun-gachanasip": "gachanasip", "umi-gachanasip": "gachanasip", "gachanasip": "gachanasip"}
export default handler
