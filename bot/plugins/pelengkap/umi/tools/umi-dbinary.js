import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "dbinary", "category": "tools", "aliasMap": {"umi-tools-dbinary": "dbinary", "umi-dbinary": "dbinary", "umi-decodebinary": "decodebinary", "umi-binary2text": "binary2text", "dbinary": "dbinary", "decodebinary": "decodebinary", "binary2text": "binary2text"}, "description": "Decode binary menjadi teks", "usage": ".dbinary <binary>", "example": ".dbinary 1001001 110110 110", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/dbinary.js", metadata, m, extra)
handler.help = ["umi-tools-dbinary <binary>"]
handler.command = ["umi-tools-dbinary", "umi-dbinary", "umi-decodebinary", "umi-binary2text", "dbinary", "decodebinary", "binary2text"]
handler.tags = ["tools"]
handler.description = "Decode binary menjadi teks"
handler.importSource = "umi"
handler.importConfig = {"name": "dbinary", "alias": ["decodebinary", "binary2text"], "category": "tools", "description": "Decode binary menjadi teks", "usage": ".dbinary <binary>", "example": ".dbinary 1001001 110110 110", "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-tools-dbinary": "dbinary", "umi-dbinary": "dbinary", "umi-decodebinary": "decodebinary", "umi-binary2text": "binary2text", "dbinary": "dbinary", "decodebinary": "decodebinary", "binary2text": "binary2text"}
export default handler
