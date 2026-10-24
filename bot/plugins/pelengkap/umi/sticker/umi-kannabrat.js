import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "kannabrat", "category": "sticker", "aliasMap": {"umi-sticker-kannabrat": "kannabrat", "umi-kannabrat": "kannabrat", "umi-kanna": "kanna", "umi-kannagen": "kannagen", "kannabrat": "kannabrat", "kanna": "kanna", "kannagen": "kannagen"}, "description": "Membuat sticker Kanna dengan teks", "usage": ".kannabrat <teks>", "example": ".kannabrat Hello World", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/sticker/kannabrat.js", metadata, m, extra)
handler.help = ["umi-sticker-kannabrat <teks>"]
handler.command = ["umi-sticker-kannabrat", "umi-kannabrat", "umi-kanna", "umi-kannagen", "kannabrat", "kanna", "kannagen"]
handler.tags = ["sticker"]
handler.description = "Membuat sticker Kanna dengan teks"
handler.importSource = "umi"
handler.importConfig = {"name": "kannabrat", "alias": ["kanna", "kannagen"], "category": "sticker", "description": "Membuat sticker Kanna dengan teks", "usage": ".kannabrat <teks>", "example": ".kannabrat Hello World", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-sticker-kannabrat": "kannabrat", "umi-kannabrat": "kannabrat", "umi-kanna": "kanna", "umi-kannagen": "kannagen", "kannabrat": "kannabrat", "kanna": "kanna", "kannagen": "kannagen"}
export default handler
