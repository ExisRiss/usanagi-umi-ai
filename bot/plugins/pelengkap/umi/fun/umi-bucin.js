/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "bucin", "category": "fun", "aliasMap": {"umi-fun-bucin": "bucin", "umi-gombal": "gombal", "umi-love": "love", "umi-romantis": "romantis"}, "description": "Random kata-kata bucin/romantis", "usage": ".bucin", "example": ".bucin", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/fun/bucin.js", metadata, m, extra)
handler.help = ["umi-fun-bucin"]
handler.command = ["umi-fun-bucin", "umi-gombal", "umi-love", "umi-romantis"]
handler.tags = ["fun"]
handler.description = "Random kata-kata bucin/romantis"
handler.importSource = "umi"
handler.importConfig = {"name": "bucin", "alias": ["gombal", "love", "romantis"], "category": "fun", "description": "Random kata-kata bucin/romantis", "usage": ".bucin", "example": ".bucin", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-fun-bucin": "bucin", "umi-gombal": "gombal", "umi-love": "love", "umi-romantis": "romantis"}
export default handler
