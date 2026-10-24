import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "truth", "category": "fun", "aliasMap": {"umi-fun-truth": "truth", "umi-truth": "truth", "umi-truthq": "truthq", "truthq": "truthq"}, "description": "Random pertanyaan truth", "usage": ".truth", "example": ".truth", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/fun/truth.js", metadata, m, extra)
handler.help = ["umi-fun-truth"]
handler.command = ["umi-fun-truth", "umi-truth", "umi-truthq", "truthq"]
handler.tags = ["fun"]
handler.description = "Random pertanyaan truth"
handler.importSource = "umi"
handler.importConfig = {"name": "truth", "alias": ["truthq"], "category": "fun", "description": "Random pertanyaan truth", "usage": ".truth", "example": ".truth", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-fun-truth": "truth", "umi-truth": "truth", "umi-truthq": "truthq", "truthq": "truthq"}
export default handler
