import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "setantilinkkick", "category": "group", "aliasMap": {"umi-group-setantilinkkick": "setantilinkkick", "umi-setantilinkkick": "setantilinkkick", "umi-setalkick": "setalkick", "umi-setlinkkick": "setlinkkick", "umi-setantlinkkick": "setantlinkkick", "setantilinkkick": "setantilinkkick", "setalkick": "setalkick", "setlinkkick": "setlinkkick", "setantlinkkick": "setantlinkkick"}, "description": "Mengubah batas peringatan AntiLinkKick", "usage": ".setantilinkkick <1-20>", "example": ".setantilinkkick 5", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/setantilinkkick.js", metadata, m, extra)
handler.help = ["umi-group-setantilinkkick <1-20>"]
handler.command = ["umi-group-setantilinkkick", "umi-setantilinkkick", "umi-setalkick", "umi-setlinkkick", "umi-setantlinkkick", "setantilinkkick", "setalkick", "setlinkkick", "setantlinkkick"]
handler.tags = ["group"]
handler.description = "Mengubah batas peringatan AntiLinkKick"
handler.importSource = "umi"
handler.importConfig = {"name": "setantilinkkick", "alias": ["setalkick", "setlinkkick", "setantlinkkick"], "category": "group", "description": "Mengubah batas peringatan AntiLinkKick", "usage": ".setantilinkkick <1-20>", "example": ".setantilinkkick 5", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "isAdmin": true, "isBotAdmin": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = true
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-setantilinkkick": "setantilinkkick", "umi-setantilinkkick": "setantilinkkick", "umi-setalkick": "setalkick", "umi-setlinkkick": "setlinkkick", "umi-setantlinkkick": "setantlinkkick", "setantilinkkick": "setantilinkkick", "setalkick": "setalkick", "setlinkkick": "setlinkkick", "setantlinkkick": "setantlinkkick"}
export default handler
