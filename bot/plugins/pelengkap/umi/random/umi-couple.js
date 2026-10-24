import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "ppcouple", "category": "random", "aliasMap": {"umi-random-ppcouple": "ppcouple", "umi-ppcouple": "ppcouple", "umi-cp": "cp", "umi-ppcp": "ppcp"}, "description": "Random gambar pp couple", "usage": ".ppcouple", "cooldown": 10, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/random/couple.js", metadata, m, extra)
handler.help = ["umi-random-ppcouple"]
handler.command = ["umi-random-ppcouple", "umi-ppcouple", "umi-cp", "umi-ppcp"]
handler.tags = ["random"]
handler.description = "Random gambar pp couple"
handler.importSource = "umi"
handler.importConfig = {"name": "ppcouple", "alias": ["cp", "ppcp"], "category": "random", "description": "Random gambar pp couple", "usage": ".ppcouple", "isGroup": true, "isBotAdmin": false, "isAdmin": false, "cooldown": 10, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-random-ppcouple": "ppcouple", "umi-ppcouple": "ppcouple", "umi-cp": "cp", "umi-ppcp": "ppcp"}
export default handler
