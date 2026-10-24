/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "prabowo-ai", "category": "ai", "aliasMap": {"umi-ai-prabowo-ai": "prabowo-ai", "umi-prabowo-ai": "prabowo-ai", "umi-prabowoi": "prabowoi", "umi-prabowo": "prabowo", "umi-pakprabowo": "pakprabowo", "prabowo-ai": "prabowo-ai", "prabowoi": "prabowoi", "prabowo": "prabowo", "pakprabowo": "pakprabowo"}, "description": "Chat dengan Pak Prabowo — Pria Sawit", "usage": ".prabowo-ai <pertanyaan>", "example": ".prabowo-ai Saudara, kita harus berdaulat!", "cooldown": 10, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/ai/prabowo-ai.js", metadata, m, extra)
handler.help = ["umi-ai-prabowo-ai <pertanyaan>"]
handler.command = ["umi-ai-prabowo-ai", "umi-prabowo-ai", "umi-prabowoi", "umi-prabowo", "umi-pakprabowo", "prabowo-ai", "prabowoi", "prabowo", "pakprabowo"]
handler.tags = ["ai"]
handler.description = "Chat dengan Pak Prabowo — Pria Sawit"
handler.importSource = "umi"
handler.importConfig = {"name": "prabowo-ai", "alias": ["prabowoi", "prabowo", "pakprabowo"], "category": "ai", "description": "Chat dengan Pak Prabowo — Pria Sawit", "usage": ".prabowo-ai <pertanyaan>", "example": ".prabowo-ai Saudara, kita harus berdaulat!", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-ai-prabowo-ai": "prabowo-ai", "umi-prabowo-ai": "prabowo-ai", "umi-prabowoi": "prabowoi", "umi-prabowo": "prabowo", "umi-pakprabowo": "pakprabowo", "prabowo-ai": "prabowo-ai", "prabowoi": "prabowoi", "prabowo": "prabowo", "pakprabowo": "pakprabowo"}
export default handler
