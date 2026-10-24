/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "rules", "category": "main", "aliasMap": {"umi-main-rules": "rules", "umi-rules": "rules", "umi-aturanbot": "aturanbot", "umi-botrules": "botrules", "umi-peraturanbot": "peraturanbot", "aturanbot": "aturanbot", "botrules": "botrules", "peraturanbot": "peraturanbot"}, "description": "Menampilkan rules dan aturan penggunaan bot secara lengkap", "usage": ".rules", "example": ".rules", "cooldown": 10, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/main/rules.js", metadata, m, extra)
handler.help = ["umi-main-rules"]
handler.command = ["umi-main-rules", "umi-rules", "umi-aturanbot", "umi-botrules", "umi-peraturanbot", "aturanbot", "botrules", "peraturanbot"]
handler.tags = ["main"]
handler.description = "Menampilkan rules dan aturan penggunaan bot secara lengkap"
handler.importSource = "umi"
handler.importConfig = {"name": "rules", "alias": ["aturanbot", "botrules", "peraturanbot"], "category": "main", "description": "Menampilkan rules dan aturan penggunaan bot secara lengkap", "usage": ".rules", "example": ".rules", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-main-rules": "rules", "umi-rules": "rules", "umi-aturanbot": "aturanbot", "umi-botrules": "botrules", "umi-peraturanbot": "peraturanbot", "aturanbot": "aturanbot", "botrules": "botrules", "peraturanbot": "peraturanbot"}
export default handler
