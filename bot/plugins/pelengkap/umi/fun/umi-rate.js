import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "rate", "category": "fun", "aliasMap": {"umi-fun-rate": "rate", "umi-rate": "rate", "umi-nilai": "nilai", "umi-rating": "rating"}, "description": "Minta bot memberi rating sesuatu", "usage": ".rate <sesuatu>", "example": ".rate wajahku", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/fun/rate.js", metadata, m, extra)
handler.help = ["umi-fun-rate <sesuatu>"]
handler.command = ["umi-fun-rate", "umi-rate", "umi-nilai", "umi-rating"]
handler.tags = ["fun"]
handler.description = "Minta bot memberi rating sesuatu"
handler.importSource = "umi"
handler.importConfig = {"name": "rate", "alias": ["nilai", "rating"], "category": "fun", "description": "Minta bot memberi rating sesuatu", "usage": ".rate <sesuatu>", "example": ".rate wajahku", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-fun-rate": "rate", "umi-rate": "rate", "umi-nilai": "nilai", "umi-rating": "rating"}
export default handler
