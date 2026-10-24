import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "jodoh", "category": "fun", "aliasMap": {"umi-fun-jodoh": "jodoh", "umi-shipcouple": "shipcouple", "shipcouple": "shipcouple"}, "description": "Jodohkan 2 member random dengan kecocokan", "usage": ".jodoh", "example": ".jodoh", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/fun/jodoh.js", metadata, m, extra)
handler.help = ["umi-fun-jodoh"]
handler.command = ["umi-fun-jodoh", "umi-shipcouple", "shipcouple"]
handler.tags = ["fun"]
handler.description = "Jodohkan 2 member random dengan kecocokan"
handler.importSource = "umi"
handler.importConfig = {"name": "jodoh", "alias": ["match", "shipcouple", "ship"], "category": "fun", "description": "Jodohkan 2 member random dengan kecocokan", "usage": ".jodoh", "example": ".jodoh", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-fun-jodoh": "jodoh", "umi-shipcouple": "shipcouple", "shipcouple": "shipcouple"}
export default handler
