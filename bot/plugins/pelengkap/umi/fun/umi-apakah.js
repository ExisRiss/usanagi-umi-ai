import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "apakah", "category": "fun", "aliasMap": {"umi-fun-apakah": "apakah", "umi-apakah": "apakah", "umi-apa": "apa"}, "description": "Tanya bot apakah sesuatu", "usage": ".apakah <pertanyaan>", "example": ".apakah aku bisa kaya?", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/fun/apakah.js", metadata, m, extra)
handler.help = ["umi-fun-apakah <pertanyaan>"]
handler.command = ["umi-fun-apakah", "umi-apakah", "umi-apa"]
handler.tags = ["fun"]
handler.description = "Tanya bot apakah sesuatu"
handler.importSource = "umi"
handler.importConfig = {"name": "apakah", "alias": ["apa"], "category": "fun", "description": "Tanya bot apakah sesuatu", "usage": ".apakah <pertanyaan>", "example": ".apakah aku bisa kaya?", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-fun-apakah": "apakah", "umi-apakah": "apakah", "umi-apa": "apa"}
export default handler
