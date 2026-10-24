import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "ttsearch", "category": "search", "aliasMap": {"umi-search-ttsearch": "ttsearch", "umi-ttsearch": "ttsearch", "umi-tiktoksearch": "tiktoksearch", "umi-tts": "tts", "umi-searchtiktok": "searchtiktok", "searchtiktok": "searchtiktok"}, "description": "Cari video TikTok", "usage": ".ttsearch <query>", "example": ".ttsearch jj epep", "cooldown": 15, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/search/ttsearch.js", metadata, m, extra)
handler.help = ["umi-search-ttsearch <query>"]
handler.command = ["umi-search-ttsearch", "umi-ttsearch", "umi-tiktoksearch", "umi-tts", "umi-searchtiktok", "searchtiktok"]
handler.tags = ["search"]
handler.description = "Cari video TikTok"
handler.importSource = "umi"
handler.importConfig = {"name": "ttsearch", "alias": ["tiktoksearch", "tts", "searchtiktok"], "category": "search", "description": "Cari video TikTok", "usage": ".ttsearch <query>", "example": ".ttsearch jj epep", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 15, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-search-ttsearch": "ttsearch", "umi-ttsearch": "ttsearch", "umi-tiktoksearch": "tiktoksearch", "umi-tts": "tts", "umi-searchtiktok": "searchtiktok", "searchtiktok": "searchtiktok"}
export default handler
