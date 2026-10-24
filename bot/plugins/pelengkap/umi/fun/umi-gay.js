import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "gay", "category": "fun", "aliasMap": {"umi-fun-gay": "gay", "umi-gay": "gay", "umi-howgay": "howgay"}, "description": "Menunjuk member paling gay di grup", "usage": ".gay", "cooldown": 10, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/fun/gay.js", metadata, m, extra)
handler.help = ["umi-fun-gay"]
handler.command = ["umi-fun-gay", "umi-gay", "umi-howgay"]
handler.tags = ["fun"]
handler.description = "Menunjuk member paling gay di grup"
handler.importSource = "umi"
handler.importConfig = {"name": "gay", "alias": ["howgay"], "category": "fun", "description": "Menunjuk member paling gay di grup", "usage": ".gay", "isGroup": true, "isBotAdmin": false, "isAdmin": false, "cooldown": 10, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-fun-gay": "gay", "umi-gay": "gay", "umi-howgay": "howgay"}
export default handler
