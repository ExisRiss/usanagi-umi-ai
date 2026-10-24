import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "bratcewek", "category": "sticker", "aliasMap": {"umi-sticker-bratcewek": "bratcewek", "umi-bratcewek": "bratcewek", "umi-cewekbrat": "cewekbrat", "umi-bratperempuan": "bratperempuan", "umi-bratgirl": "bratgirl", "bratcewek": "bratcewek", "bratperempuan": "bratperempuan", "bratgirl": "bratgirl"}, "description": "Membuat sticker brat", "usage": ".bratcewek <text>", "example": ".bratcewek Hai semua", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/sticker/bratcewek.js", metadata, m, extra)
handler.help = ["umi-sticker-bratcewek <text>"]
handler.command = ["umi-sticker-bratcewek", "umi-bratcewek", "umi-cewekbrat", "umi-bratperempuan", "umi-bratgirl", "bratcewek", "bratperempuan", "bratgirl"]
handler.tags = ["sticker"]
handler.description = "Membuat sticker brat"
handler.importSource = "umi"
handler.importConfig = {"name": "bratcewek", "alias": ["cewekbrat", "bratperempuan", "bratgirl"], "category": "sticker", "description": "Membuat sticker brat", "usage": ".bratcewek <text>", "example": ".bratcewek Hai semua", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-sticker-bratcewek": "bratcewek", "umi-bratcewek": "bratcewek", "umi-cewekbrat": "cewekbrat", "umi-bratperempuan": "bratperempuan", "umi-bratgirl": "bratgirl", "bratcewek": "bratcewek", "bratperempuan": "bratperempuan", "bratgirl": "bratgirl"}
export default handler
