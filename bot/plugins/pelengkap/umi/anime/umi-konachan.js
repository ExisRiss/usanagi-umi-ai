import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "konachan", "category": "anime", "aliasMap": {"umi-anime-konachan": "konachan", "umi-konachan": "konachan", "umi-konasearch": "konasearch", "umi-kona": "kona", "umi-konaimg": "konaimg", "konachan": "konachan", "konasearch": "konasearch", "kona": "kona", "konaimg": "konaimg"}, "description": "Cari gambar anime dari konachan", "usage": ".konachan <tags>", "example": ".konachan long_hair blue_eyes", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/anime/konachan.js", metadata, m, extra)
handler.help = ["umi-anime-konachan <tags>"]
handler.command = ["umi-anime-konachan", "umi-konachan", "umi-konasearch", "umi-kona", "umi-konaimg", "konachan", "konasearch", "kona", "konaimg"]
handler.tags = ["anime"]
handler.description = "Cari gambar anime dari konachan"
handler.importSource = "umi"
handler.importConfig = {"name": "konachan", "alias": ["konasearch", "kona", "konaimg"], "category": "anime", "description": "Cari gambar anime dari konachan", "usage": ".konachan <tags>", "example": ".konachan long_hair blue_eyes", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-anime-konachan": "konachan", "umi-konachan": "konachan", "umi-konasearch": "konasearch", "umi-kona": "kona", "umi-konaimg": "konaimg", "konachan": "konachan", "konasearch": "konasearch", "kona": "kona", "konaimg": "konaimg"}
export default handler
