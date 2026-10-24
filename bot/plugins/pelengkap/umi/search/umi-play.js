import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "play", "category": "search", "aliasMap": {"umi-search-play": "play", "umi-play": "play", "umi-playaudio": "playaudio"}, "description": "Putar musik dari YouTube", "usage": ".play <query>", "example": ".play komang", "cooldown": 15, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/search/play.js", metadata, m, extra)
handler.help = ["umi-search-play <query>"]
handler.command = ["umi-search-play", "umi-play", "umi-playaudio"]
handler.tags = ["search"]
handler.description = "Putar musik dari YouTube"
handler.importSource = "umi"
handler.importConfig = {"name": "play", "alias": ["playaudio"], "category": "search", "description": "Putar musik dari YouTube", "usage": ".play <query>", "example": ".play komang", "cooldown": 15, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-search-play": "play", "umi-play": "play", "umi-playaudio": "playaudio"}
export default handler
