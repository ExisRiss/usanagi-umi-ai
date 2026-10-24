import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "rekom-anime", "category": "anime", "aliasMap": {"umi-anime-rekom-anime": "rekom-anime", "umi-rekom-anime": "rekom-anime", "umi-anime-rekom": "anime-rekom", "umi-rekanime": "rekanime", "rekom-anime": "rekom-anime", "anime-rekom": "anime-rekom", "rekanime": "rekanime"}, "description": "Rekomendasi anime random", "usage": ".rekom-anime", "example": ".rekom-anime", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/anime/rekomanime.js", metadata, m, extra)
handler.help = ["umi-anime-rekom-anime"]
handler.command = ["umi-anime-rekom-anime", "umi-rekom-anime", "umi-anime-rekom", "umi-rekanime", "rekom-anime", "anime-rekom", "rekanime"]
handler.tags = ["anime"]
handler.description = "Rekomendasi anime random"
handler.importSource = "umi"
handler.importConfig = {"name": "rekom-anime", "alias": ["anime-rekom", "rekanime"], "category": "anime", "description": "Rekomendasi anime random", "usage": ".rekom-anime", "example": ".rekom-anime", "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-anime-rekom-anime": "rekom-anime", "umi-rekom-anime": "rekom-anime", "umi-anime-rekom": "anime-rekom", "umi-rekanime": "rekanime", "rekom-anime": "rekom-anime", "anime-rekom": "anime-rekom", "rekanime": "rekanime"}
export default handler
