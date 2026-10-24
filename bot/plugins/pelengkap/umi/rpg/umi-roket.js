import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "roket", "category": "rpg", "aliasMap": {"umi-rpg-roket": "roket", "umi-roket": "roket", "umi-ngroket": "ngroket", "umi-groket": "groket", "umi-jadiroket": "jadiroket", "roket": "roket", "ngroket": "ngroket", "groket": "groket", "jadiroket": "jadiroket"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/roket.js", metadata, m, extra)
handler.help = ["umi-rpg-roket"]
handler.command = ["umi-rpg-roket", "umi-roket", "umi-ngroket", "umi-groket", "umi-jadiroket", "roket", "ngroket", "groket", "jadiroket"]
handler.tags = ["rpg"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "roket", "alias": ["ngroket", "groket", "jadiroket"], "category": "rpg", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-rpg-roket": "roket", "umi-roket": "roket", "umi-ngroket": "ngroket", "umi-groket": "groket", "umi-jadiroket": "jadiroket", "roket": "roket", "ngroket": "ngroket", "groket": "groket", "jadiroket": "jadiroket"}
export default handler
