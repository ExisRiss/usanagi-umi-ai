/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "sstablet", "category": "tools", "aliasMap": {"umi-tools-sstablet": "sstablet", "umi-sstablet": "sstablet", "umi-sstab": "sstab", "umi-sweb": "sweb", "sstablet": "sstablet", "sstab": "sstab", "sweb": "sweb"}, "description": "Mengambil screenshot website tampilan tablet", "usage": ".sstablet <url>", "example": ".sstablet https://google.com", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/sstablet.js", metadata, m, extra)
handler.help = ["umi-tools-sstablet <url>"]
handler.command = ["umi-tools-sstablet", "umi-sstablet", "umi-sstab", "umi-sweb", "sstablet", "sstab", "sweb"]
handler.tags = ["tools"]
handler.description = "Mengambil screenshot website tampilan tablet"
handler.importSource = "umi"
handler.importConfig = {"name": "sstablet", "alias": ["sstablet", "sstab", "sweb"], "category": "tools", "description": "Mengambil screenshot website tampilan tablet", "usage": ".sstablet <url>", "example": ".sstablet https://google.com", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-tools-sstablet": "sstablet", "umi-sstablet": "sstablet", "umi-sstab": "sstab", "umi-sweb": "sweb", "sstablet": "sstablet", "sstab": "sstab", "sweb": "sweb"}
export default handler
