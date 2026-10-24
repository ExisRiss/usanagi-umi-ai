/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "simi", "category": "ai", "aliasMap": {"umi-ai-simi": "simi", "umi-simi": "simi", "umi-simisimi": "simisimi", "simi": "simi", "simisimi": "simisimi"}, "description": "Ngobrol santai bareng SimiSimi", "usage": ".simi <pesan>", "example": ".simi Halo Simi!", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/ai/simi.js", metadata, m, extra)
handler.help = ["umi-ai-simi <pesan>"]
handler.command = ["umi-ai-simi", "umi-simi", "umi-simisimi", "simi", "simisimi"]
handler.tags = ["ai"]
handler.description = "Ngobrol santai bareng SimiSimi"
handler.importSource = "umi"
handler.importConfig = {"name": "simi", "alias": ["simisimi"], "category": "ai", "description": "Ngobrol santai bareng SimiSimi", "usage": ".simi <pesan>", "example": ".simi Halo Simi!", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-ai-simi": "simi", "umi-simi": "simi", "umi-simisimi": "simisimi", "simi": "simi", "simisimi": "simisimi"}
export default handler
