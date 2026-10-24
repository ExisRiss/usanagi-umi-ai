import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "dare", "category": "fun", "aliasMap": {"umi-fun-dare": "dare", "umi-dare": "dare", "umi-dareq": "dareq", "umi-tantang": "tantang", "dareq": "dareq"}, "description": "Random tantangan dare", "usage": ".dare", "example": ".dare", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/fun/dare.js", metadata, m, extra)
handler.help = ["umi-fun-dare"]
handler.command = ["umi-fun-dare", "umi-dare", "umi-dareq", "umi-tantang", "dareq"]
handler.tags = ["fun"]
handler.description = "Random tantangan dare"
handler.importSource = "umi"
handler.importConfig = {"name": "dare", "alias": ["dareq", "tantang"], "category": "fun", "description": "Random tantangan dare", "usage": ".dare", "example": ".dare", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-fun-dare": "dare", "umi-dare": "dare", "umi-dareq": "dareq", "umi-tantang": "tantang", "dareq": "dareq"}
export default handler
