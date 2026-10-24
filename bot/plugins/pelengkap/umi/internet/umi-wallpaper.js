import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "wallcraft", "category": "internet", "aliasMap": {"umi-internet-wallcraft": "wallcraft", "umi-wallcraft": "wallcraft", "umi-wallcraftsearch": "wallcraftsearch", "umi-walcraft": "walcraft", "umi-wallpaperscraft": "wallpaperscraft", "wallcraft": "wallcraft", "wallcraftsearch": "wallcraftsearch", "walcraft": "walcraft", "wallpaperscraft": "wallpaperscraft"}, "description": "Mencari dan mengunduh wallpaper HD dari Wallcraft", "usage": ".wallcraft <query>", "example": ".wallcraft cyber city", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/internet/wallpaper.js", metadata, m, extra)
handler.help = ["umi-internet-wallcraft <query>"]
handler.command = ["umi-internet-wallcraft", "umi-wallcraft", "umi-wallcraftsearch", "umi-walcraft", "umi-wallpaperscraft", "wallcraft", "wallcraftsearch", "walcraft", "wallpaperscraft"]
handler.tags = ["internet"]
handler.description = "Mencari dan mengunduh wallpaper HD dari Wallcraft"
handler.importSource = "umi"
handler.importConfig = {"name": "wallcraft", "alias": ["wallcraftsearch", "walcraft", "wallpaperscraft"], "category": "internet", "description": "Mencari dan mengunduh wallpaper HD dari Wallcraft", "usage": ".wallcraft <query>", "example": ".wallcraft cyber city", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-internet-wallcraft": "wallcraft", "umi-wallcraft": "wallcraft", "umi-wallcraftsearch": "wallcraftsearch", "umi-walcraft": "walcraft", "umi-wallpaperscraft": "wallpaperscraft", "wallcraft": "wallcraft", "wallcraftsearch": "wallcraftsearch", "walcraft": "walcraft", "wallpaperscraft": "wallpaperscraft"}
export default handler
