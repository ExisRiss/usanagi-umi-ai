/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "bluearchive-char", "category": "info", "aliasMap": {"umi-info-bluearchive-char": "bluearchive-char", "umi-bluearchive-char": "bluearchive-char", "umi-bachar": "bachar", "bluearchive-char": "bluearchive-char", "bachar": "bachar"}, "description": "Lihat info character Blue Archive", "usage": ".bluearchive-char <nama>", "example": ".bluearchive-char shiroko", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/info/bluearchive-char.js", metadata, m, extra)
handler.help = ["umi-info-bluearchive-char <nama>"]
handler.command = ["umi-info-bluearchive-char", "umi-bluearchive-char", "umi-bachar", "bluearchive-char", "bachar"]
handler.tags = ["info"]
handler.description = "Lihat info character Blue Archive"
handler.importSource = "umi"
handler.importConfig = {"name": "bluearchive-char", "alias": ["bachar"], "category": "info", "description": "Lihat info character Blue Archive", "usage": ".bluearchive-char <nama>", "example": ".bluearchive-char shiroko", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-info-bluearchive-char": "bluearchive-char", "umi-bluearchive-char": "bluearchive-char", "umi-bachar": "bachar", "bluearchive-char": "bluearchive-char", "bachar": "bachar"}
export default handler
