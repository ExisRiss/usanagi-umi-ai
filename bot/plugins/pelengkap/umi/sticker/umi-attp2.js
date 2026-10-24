import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "attp2", "category": "sticker", "aliasMap": {"umi-sticker-attp2": "attp2", "umi-attp2": "attp2", "attp2": "attp2"}, "description": "Buat sticker animasi teks", "usage": ".attp2 <teks>", "example": ".attp2 Halo dunia", "cooldown": 5, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/sticker/attp2.js", metadata, m, extra)
handler.help = ["umi-sticker-attp2 <teks>"]
handler.command = ["umi-sticker-attp2", "umi-attp2", "attp2"]
handler.tags = ["sticker"]
handler.description = "Buat sticker animasi teks"
handler.importSource = "umi"
handler.importConfig = {"name": "attp2", "alias": ["attp2"], "category": "sticker", "description": "Buat sticker animasi teks", "usage": ".attp2 <teks>", "example": ".attp2 Halo dunia", "cooldown": 5, "energi": 2}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-sticker-attp2": "attp2", "umi-attp2": "attp2", "attp2": "attp2"}
export default handler
