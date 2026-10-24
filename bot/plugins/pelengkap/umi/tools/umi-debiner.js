import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "debiner", "category": "tools", "aliasMap": {"umi-tools-debiner": "debiner", "umi-debiner": "debiner", "umi-bintotext": "bintotext", "umi-bin2teks": "bin2teks", "umi-decodebiner": "decodebiner", "debiner": "debiner", "bintotext": "bintotext", "bin2teks": "bin2teks", "decodebiner": "decodebiner"}, "description": "Mengubah kode binary menjadi teks", "usage": ".debiner <binary>", "example": ".debiner 01001000 01100101", "cooldown": 2, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/debiner.js", metadata, m, extra)
handler.help = ["umi-tools-debiner <binary>"]
handler.command = ["umi-tools-debiner", "umi-debiner", "umi-bintotext", "umi-bin2teks", "umi-decodebiner", "debiner", "bintotext", "bin2teks", "decodebiner"]
handler.tags = ["tools"]
handler.description = "Mengubah kode binary menjadi teks"
handler.importSource = "umi"
handler.importConfig = {"name": "debiner", "alias": ["bintotext", "bin2teks", "decodebiner"], "category": "tools", "description": "Mengubah kode binary menjadi teks", "usage": ".debiner <binary>", "example": ".debiner 01001000 01100101", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 2, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-tools-debiner": "debiner", "umi-debiner": "debiner", "umi-bintotext": "bintotext", "umi-bin2teks": "bin2teks", "umi-decodebiner": "decodebiner", "debiner": "debiner", "bintotext": "bintotext", "bin2teks": "bin2teks", "decodebiner": "decodebiner"}
export default handler
