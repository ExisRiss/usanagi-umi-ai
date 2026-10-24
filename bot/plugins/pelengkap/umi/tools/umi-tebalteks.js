/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "tebalteks", "category": "tools", "aliasMap": {"umi-tools-tebalteks": "tebalteks", "umi-tebalteks": "tebalteks", "umi-boldtext": "boldtext", "tebalteks": "tebalteks", "boldtext": "boldtext"}, "description": "Teks tebal ala Umi 😈💗 (4 style)", "usage": ".tebalteks <teks>", "example": ".tebalteks umiWangy", "cooldown": 3}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/tebalteks.js", metadata, m, extra)
handler.help = ["umi-tools-tebalteks <teks>"]
handler.command = ["umi-tools-tebalteks", "umi-tebalteks", "umi-boldtext", "tebalteks", "boldtext"]
handler.tags = ["tools"]
handler.description = "Teks tebal ala Umi 😈💗 (4 style)"
handler.importSource = "umi"
handler.importConfig = {"name": "tebalteks", "alias": ["boldtext"], "category": "tools", "description": "Teks tebal ala Umi 😈💗 (4 style)", "usage": ".tebalteks <teks>", "example": ".tebalteks umiWangy", "cooldown": 3, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-tools-tebalteks": "tebalteks", "umi-tebalteks": "tebalteks", "umi-boldtext": "boldtext", "tebalteks": "tebalteks", "boldtext": "boldtext"}
export default handler
