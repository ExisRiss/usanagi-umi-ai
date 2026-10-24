import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "gachabini", "category": "fun", "aliasMap": {"umi-fun-gachabini": "gachabini", "umi-gachabini": "gachabini", "gachabini": "gachabini"}, "description": "Gacha bini waifu random 300+ karakter", "usage": ".gachabini"}
const handler = (m, extra) => runImportedFeature("umi", "plugins/fun/gachabini.js", metadata, m, extra)
handler.help = ["umi-fun-gachabini"]
handler.command = ["umi-fun-gachabini", "umi-gachabini", "gachabini"]
handler.tags = ["fun"]
handler.description = "Gacha bini waifu random 300+ karakter"
handler.importSource = "umi"
handler.importConfig = {"name": "gachabini", "category": "fun", "description": "Gacha bini waifu random 300+ karakter", "usage": ".gachabini", "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-fun-gachabini": "gachabini", "umi-gachabini": "gachabini", "gachabini": "gachabini"}
export default handler
