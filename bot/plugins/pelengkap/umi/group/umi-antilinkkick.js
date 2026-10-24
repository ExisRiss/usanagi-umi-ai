import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "antilinkkick", "category": "group", "aliasMap": {"umi-group-antilinkkick": "antilinkkick", "umi-antilinkkick": "antilinkkick", "umi-alkick": "alkick", "umi-antilinkwarn": "antilinkwarn", "umi-linkkick": "linkkick", "antilinkkick": "antilinkkick", "alkick": "alkick", "antilinkwarn": "antilinkwarn", "linkkick": "linkkick"}, "description": "Hapus link, beri peringatan, lalu kick saat batas tercapai", "usage": ".antilinkkick <on/off/status/reset>", "example": ".antilinkkick on", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/antilinkkick.js", metadata, m, extra)
handler.help = ["umi-group-antilinkkick <on/off/status/reset>"]
handler.command = ["umi-group-antilinkkick", "umi-antilinkkick", "umi-alkick", "umi-antilinkwarn", "umi-linkkick", "antilinkkick", "alkick", "antilinkwarn", "linkkick"]
handler.tags = ["group"]
handler.description = "Hapus link, beri peringatan, lalu kick saat batas tercapai"
handler.importSource = "umi"
handler.importConfig = {"name": "antilinkkick", "alias": ["alkick", "antilinkwarn", "linkkick"], "category": "group", "description": "Hapus link, beri peringatan, lalu kick saat batas tercapai", "usage": ".antilinkkick <on/off/status/reset>", "example": ".antilinkkick on", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "isAdmin": true, "isBotAdmin": true, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = true
handler.botAdmin = true
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-antilinkkick": "antilinkkick", "umi-antilinkkick": "antilinkkick", "umi-alkick": "alkick", "umi-antilinkwarn": "antilinkwarn", "umi-linkkick": "linkkick", "antilinkkick": "antilinkkick", "alkick": "alkick", "antilinkwarn": "antilinkwarn", "linkkick": "linkkick"}
export default handler
