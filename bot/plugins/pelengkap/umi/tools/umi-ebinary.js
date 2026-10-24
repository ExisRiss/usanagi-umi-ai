import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "ebinary", "category": "tools", "aliasMap": {"umi-tools-ebinary": "ebinary", "umi-ebinary": "ebinary", "umi-encodebinary": "encodebinary", "umi-text2binary": "text2binary", "ebinary": "ebinary", "encodebinary": "encodebinary", "text2binary": "text2binary"}, "description": "Encode teks menjadi binary", "usage": ".ebinary <teks>", "example": ".ebinary Umi", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/ebinary.js", metadata, m, extra)
handler.help = ["umi-tools-ebinary <teks>"]
handler.command = ["umi-tools-ebinary", "umi-ebinary", "umi-encodebinary", "umi-text2binary", "ebinary", "encodebinary", "text2binary"]
handler.tags = ["tools"]
handler.description = "Encode teks menjadi binary"
handler.importSource = "umi"
handler.importConfig = {"name": "ebinary", "alias": ["encodebinary", "text2binary"], "category": "tools", "description": "Encode teks menjadi binary", "usage": ".ebinary <teks>", "example": ".ebinary Umi", "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-tools-ebinary": "ebinary", "umi-ebinary": "ebinary", "umi-encodebinary": "encodebinary", "umi-text2binary": "text2binary", "ebinary": "ebinary", "encodebinary": "encodebinary", "text2binary": "text2binary"}
export default handler
