import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "anticustom", "category": "group", "aliasMap": {"umi-group-anticustom": "anticustom", "umi-anticustom": "anticustom", "umi-antiaddcustom": "antiaddcustom", "umi-customanti": "customanti", "anticustom": "anticustom", "antiaddcustom": "antiaddcustom", "customanti": "customanti"}, "description": "Bikin AntiCustom lewat sesi tanya jawab per langkah", "usage": ".anticustom <on/off/list/add/del/metode/cancel>", "example": ".anticustom", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/anticustom.js", metadata, m, extra)
handler.help = ["umi-group-anticustom <on/off/list/add/del/metode/cancel>"]
handler.command = ["umi-group-anticustom", "umi-anticustom", "umi-antiaddcustom", "umi-customanti", "anticustom", "antiaddcustom", "customanti"]
handler.tags = ["group"]
handler.description = "Bikin AntiCustom lewat sesi tanya jawab per langkah"
handler.importSource = "umi"
handler.importConfig = {"name": "anticustom", "alias": ["antiaddcustom", "customanti"], "category": "group", "description": "Bikin AntiCustom lewat sesi tanya jawab per langkah", "usage": ".anticustom <on/off/list/add/del/metode/cancel>", "example": ".anticustom", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "isAdmin": true, "isBotAdmin": true, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = true
handler.botAdmin = true
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-anticustom": "anticustom", "umi-anticustom": "anticustom", "umi-antiaddcustom": "antiaddcustom", "umi-customanti": "customanti", "anticustom": "anticustom", "antiaddcustom": "antiaddcustom", "customanti": "customanti"}
export default handler
