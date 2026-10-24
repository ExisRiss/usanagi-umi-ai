import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "talkingphoto", "category": "ai", "aliasMap": {"umi-ai-talkingphoto": "talkingphoto", "umi-talkingphoto": "talkingphoto", "umi-talkphoto": "talkphoto", "talkingphoto": "talkingphoto", "talkphoto": "talkphoto"}, "description": "Mengubah foto menjadi talking photo/video", "usage": ".talkingphoto <teks> | woman1|woman2|man1|man2 (reply gambar)", "example": ".talkingphoto aku adalah asisten AI | woman1", "cooldown": 60, "energi": 3}
const handler = (m, extra) => runImportedFeature("umi", "plugins/ai/talkingphoto.js", metadata, m, extra)
handler.help = ["umi-ai-talkingphoto <teks> | woman1|woman2|man1|man2 (reply gambar)"]
handler.command = ["umi-ai-talkingphoto", "umi-talkingphoto", "umi-talkphoto", "talkingphoto", "talkphoto"]
handler.tags = ["ai"]
handler.description = "Mengubah foto menjadi talking photo/video"
handler.importSource = "umi"
handler.importConfig = {"name": "talkingphoto", "alias": ["talkphoto"], "category": "ai", "description": "Mengubah foto menjadi talking photo/video", "usage": ".talkingphoto <teks> | woman1|woman2|man1|man2 (reply gambar)", "example": ".talkingphoto aku adalah asisten AI | woman1", "isPremium": true, "cooldown": 60, "energi": 3, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = true
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-ai-talkingphoto": "talkingphoto", "umi-talkingphoto": "talkingphoto", "umi-talkphoto": "talkphoto", "talkingphoto": "talkingphoto", "talkphoto": "talkphoto"}
export default handler
