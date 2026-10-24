/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "character-ai", "category": "ai", "aliasMap": {"umi-ai-character-ai": "character-ai", "umi-character-ai": "character-ai", "umi-cai": "cai", "umi-charai": "charai", "character-ai": "character-ai", "cai": "cai", "charai": "charai"}, "description": "Cari karakter AI dan jadikan sebagai Auto AI di chat ini", "usage": ".character-ai search <nama> | .character-ai off | .character-ai reset", "example": ".character-ai search yuji", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/ai/characterai.js", metadata, m, extra)
handler.help = ["umi-ai-character-ai search <nama> | .character-ai off | .character-ai reset"]
handler.command = ["umi-ai-character-ai", "umi-character-ai", "umi-cai", "umi-charai", "character-ai", "cai", "charai"]
handler.tags = ["ai"]
handler.description = "Cari karakter AI dan jadikan sebagai Auto AI di chat ini"
handler.importSource = "umi"
handler.importConfig = {"name": "character-ai", "alias": ["cai", "charai"], "category": "ai", "description": "Cari karakter AI dan jadikan sebagai Auto AI di chat ini", "usage": ".character-ai search <nama> | .character-ai off | .character-ai reset", "example": ".character-ai search yuji", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-ai-character-ai": "character-ai", "umi-character-ai": "character-ai", "umi-cai": "cai", "umi-charai": "charai", "character-ai": "character-ai", "cai": "cai", "charai": "charai"}
export default handler
