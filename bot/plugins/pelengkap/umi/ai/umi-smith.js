/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "chatsmith", "category": "ai", "aliasMap": {"umi-ai-chatsmith": "chatsmith", "umi-chatsmith": "chatsmith", "umi-smith": "smith", "umi-chatsmithai": "chatsmithai", "umi-smithai": "smithai", "chatsmith": "chatsmith", "smith": "smith", "chatsmithai": "chatsmithai", "smithai": "smithai"}, "description": "AI Chat menggunakan Chat Smith (GPT-4o Mini)", "usage": ".chatsmith <pesan>", "example": ".chatsmith Siapakah penemu listrik?", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/ai/smith.js", metadata, m, extra)
handler.help = ["umi-ai-chatsmith <pesan>"]
handler.command = ["umi-ai-chatsmith", "umi-chatsmith", "umi-smith", "umi-chatsmithai", "umi-smithai", "chatsmith", "smith", "chatsmithai", "smithai"]
handler.tags = ["ai"]
handler.description = "AI Chat menggunakan Chat Smith (GPT-4o Mini)"
handler.importSource = "umi"
handler.importConfig = {"name": "chatsmith", "alias": ["smith", "chatsmithai", "smithai"], "category": "ai", "description": "AI Chat menggunakan Chat Smith (GPT-4o Mini)", "usage": ".chatsmith <pesan>", "example": ".chatsmith Siapakah penemu listrik?", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-ai-chatsmith": "chatsmith", "umi-chatsmith": "chatsmith", "umi-smith": "smith", "umi-chatsmithai": "chatsmithai", "umi-smithai": "smithai", "chatsmith": "chatsmith", "smith": "smith", "chatsmithai": "chatsmithai", "smithai": "smithai"}
export default handler
