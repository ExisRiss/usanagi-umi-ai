import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "fliptext", "category": "tools", "aliasMap": {"umi-tools-fliptext": "fliptext", "umi-fliptext": "fliptext", "umi-baliktext": "baliktext", "fliptext": "fliptext", "baliktext": "baliktext"}, "description": "Membalik susunan teks", "usage": ".fliptext <teks>", "example": ".fliptext Umi MD", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/fliptext.js", metadata, m, extra)
handler.help = ["umi-tools-fliptext <teks>"]
handler.command = ["umi-tools-fliptext", "umi-fliptext", "umi-baliktext", "fliptext", "baliktext"]
handler.tags = ["tools"]
handler.description = "Membalik susunan teks"
handler.importSource = "umi"
handler.importConfig = {"name": "fliptext", "alias": ["baliktext"], "category": "tools", "description": "Membalik susunan teks", "usage": ".fliptext <teks>", "example": ".fliptext Umi MD", "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-tools-fliptext": "fliptext", "umi-fliptext": "fliptext", "umi-baliktext": "baliktext", "fliptext": "fliptext", "baliktext": "baliktext"}
export default handler
