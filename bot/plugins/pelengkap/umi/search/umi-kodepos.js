import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "kodepos", "category": "search", "aliasMap": {"umi-search-kodepos": "kodepos", "umi-kodepos": "kodepos", "kodepos": "kodepos"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/search/kodepos.js", metadata, m, extra)
handler.help = ["umi-search-kodepos"]
handler.command = ["umi-search-kodepos", "umi-kodepos", "kodepos"]
handler.tags = ["search"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "kodepos", "alias": [], "category": "search", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-search-kodepos": "kodepos", "umi-kodepos": "kodepos", "kodepos": "kodepos"}
export default handler
