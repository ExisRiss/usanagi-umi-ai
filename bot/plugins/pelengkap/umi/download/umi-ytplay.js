import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "ytplay", "category": "download", "aliasMap": {"umi-download-ytplay": "ytplay", "umi-ytplay": "ytplay", "umi-ytp": "ytp"}, "description": "Putar video YouTube dengan HTML AI Rich + Direct Player", "usage": ".ytplay <judul/link>", "example": ".ytplay Alan Walker Faded", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/download/ytplay.js", metadata, m, extra)
handler.help = ["umi-download-ytplay <judul/link>"]
handler.command = ["umi-download-ytplay", "umi-ytplay", "umi-ytp"]
handler.tags = ["download"]
handler.description = "Putar video YouTube dengan HTML AI Rich + Direct Player"
handler.importSource = "umi"
handler.importConfig = {"name": "ytplay", "alias": ["ytp"], "category": "download", "description": "Putar video YouTube dengan HTML AI Rich + Direct Player", "usage": ".ytplay <judul/link>", "example": ".ytplay Alan Walker Faded", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-download-ytplay": "ytplay", "umi-ytplay": "ytplay", "umi-ytp": "ytp"}
export default handler
