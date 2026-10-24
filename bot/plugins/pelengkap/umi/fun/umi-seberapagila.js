import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "seberapagila", "category": "fun", "aliasMap": {"umi-fun-seberapagila": "seberapagila", "umi-seberapagila": "seberapagila", "seberapagila": "seberapagila"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/fun/seberapagila.js", metadata, m, extra)
handler.help = ["umi-fun-seberapagila"]
handler.command = ["umi-fun-seberapagila", "umi-seberapagila", "seberapagila"]
handler.tags = ["fun"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "seberapagila", "alias": [], "category": "fun", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-fun-seberapagila": "seberapagila", "umi-seberapagila": "seberapagila", "seberapagila": "seberapagila"}
export default handler
