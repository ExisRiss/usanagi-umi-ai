import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "genshinstalk", "category": "stalker", "aliasMap": {"umi-stalker-genshinstalk": "genshinstalk", "umi-genshinstalk": "genshinstalk", "umi-genshin": "genshin", "umi-stalkgenshin": "stalkgenshin", "umi-gi": "gi", "genshinstalk": "genshinstalk", "genshin": "genshin", "stalkgenshin": "stalkgenshin", "gi": "gi"}, "description": "Melihat informasi akun Genshin Impact berdasarkan UID.", "usage": ".genshinstalk <uid>", "example": ".genshinstalk 856012067", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/stalker/genshinstalk.js", metadata, m, extra)
handler.help = ["umi-stalker-genshinstalk <uid>"]
handler.command = ["umi-stalker-genshinstalk", "umi-genshinstalk", "umi-genshin", "umi-stalkgenshin", "umi-gi", "genshinstalk", "genshin", "stalkgenshin", "gi"]
handler.tags = ["stalker"]
handler.description = "Melihat informasi akun Genshin Impact berdasarkan UID."
handler.importSource = "umi"
handler.importConfig = {"name": "genshinstalk", "alias": ["genshin", "stalkgenshin", "gi"], "category": "stalker", "description": "Melihat informasi akun Genshin Impact berdasarkan UID.", "usage": ".genshinstalk <uid>", "example": ".genshinstalk 856012067", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-stalker-genshinstalk": "genshinstalk", "umi-genshinstalk": "genshinstalk", "umi-genshin": "genshin", "umi-stalkgenshin": "stalkgenshin", "umi-gi": "gi", "genshinstalk": "genshinstalk", "genshin": "genshin", "stalkgenshin": "stalkgenshin", "gi": "gi"}
export default handler
