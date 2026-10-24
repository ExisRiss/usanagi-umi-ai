import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "playncs", "category": "music", "aliasMap": {"umi-music-playncs": "playncs", "umi-playncs": "playncs", "umi-ncssearch": "ncssearch", "umi-ncsplay": "ncsplay", "playncs": "playncs", "ncssearch": "ncssearch", "ncsplay": "ncsplay"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/music/playncs.js", metadata, m, extra)
handler.help = ["umi-music-playncs"]
handler.command = ["umi-music-playncs", "umi-playncs", "umi-ncssearch", "umi-ncsplay", "playncs", "ncssearch", "ncsplay"]
handler.tags = ["music"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "playncs", "alias": ["ncssearch", "ncsplay"], "category": "music", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-music-playncs": "playncs", "umi-playncs": "playncs", "umi-ncssearch": "ncssearch", "umi-ncsplay": "ncsplay", "playncs": "playncs", "ncssearch": "ncssearch", "ncsplay": "ncsplay"}
export default handler
