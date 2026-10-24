import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "shareteks", "category": "tools", "aliasMap": {"umi-tools-shareteks": "shareteks", "umi-shareteks": "shareteks", "umi-bagiteks": "bagiteks", "shareteks": "shareteks", "bagiteks": "bagiteks"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/sharetext.js", metadata, m, extra)
handler.help = ["umi-tools-shareteks"]
handler.command = ["umi-tools-shareteks", "umi-shareteks", "umi-bagiteks", "shareteks", "bagiteks"]
handler.tags = ["tools"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "shareteks", "alias": ["bagiteks"], "category": "tools", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-tools-shareteks": "shareteks", "umi-shareteks": "shareteks", "umi-bagiteks": "bagiteks", "shareteks": "shareteks", "bagiteks": "bagiteks"}
export default handler
