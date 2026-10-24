import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "spotplay", "category": "search", "aliasMap": {"umi-search-spotplay": "spotplay", "umi-spotplay": "spotplay", "umi-splay": "splay", "spotplay": "spotplay", "splay": "splay"}, "description": "Putar musik dari Spotify", "usage": ".spotplay <query>", "example": ".spotplay neffex grateful", "cooldown": 15, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/search/spotplay.js", metadata, m, extra)
handler.help = ["umi-search-spotplay <query>"]
handler.command = ["umi-search-spotplay", "umi-spotplay", "umi-splay", "spotplay", "splay"]
handler.tags = ["search"]
handler.description = "Putar musik dari Spotify"
handler.importSource = "umi"
handler.importConfig = {"name": "spotplay", "alias": ["splay", "sp"], "category": "search", "description": "Putar musik dari Spotify", "usage": ".spotplay <query>", "example": ".spotplay neffex grateful", "cooldown": 15, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-search-spotplay": "spotplay", "umi-spotplay": "spotplay", "umi-splay": "splay", "spotplay": "spotplay", "splay": "splay"}
export default handler
