/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "nulis", "category": "tools", "aliasMap": {"umi-tools-nulis": "nulis", "umi-tulis": "tulis", "umi-write": "write"}, "description": "Generate tulisan tangan di kertas", "usage": ".nulis <teks>", "example": ".nulis Aku cinta kamu selamanya", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/nulis.js", metadata, m, extra)
handler.help = ["umi-tools-nulis <teks>"]
handler.command = ["umi-tools-nulis", "umi-tulis", "umi-write"]
handler.tags = ["tools"]
handler.description = "Generate tulisan tangan di kertas"
handler.importSource = "umi"
handler.importConfig = {"name": "nulis", "alias": ["tulis", "write"], "category": "tools", "description": "Generate tulisan tangan di kertas", "usage": ".nulis <teks>", "example": ".nulis Aku cinta kamu selamanya", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-tools-nulis": "nulis", "umi-tulis": "tulis", "umi-write": "write"}
export default handler
