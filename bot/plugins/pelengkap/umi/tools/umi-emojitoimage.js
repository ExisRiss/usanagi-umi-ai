import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "emojitoimage", "category": "tools", "aliasMap": {"umi-tools-emojitoimage": "emojitoimage", "umi-emojitoimage": "emojitoimage", "umi-emoji2img": "emoji2img", "umi-emojiimg": "emojiimg", "umi-e2i": "e2i", "emojitoimage": "emojitoimage", "emoji2img": "emoji2img", "emojiimg": "emojiimg", "e2i": "e2i"}, "description": "Konversi emoji ke gambar HD (style Apple)", "usage": ".emojitoimage <emoji> [style]", "example": ".emojitoimage 😳 apple", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/emojitoimage.js", metadata, m, extra)
handler.help = ["umi-tools-emojitoimage <emoji> [style]"]
handler.command = ["umi-tools-emojitoimage", "umi-emojitoimage", "umi-emoji2img", "umi-emojiimg", "umi-e2i", "emojitoimage", "emoji2img", "emojiimg", "e2i"]
handler.tags = ["tools"]
handler.description = "Konversi emoji ke gambar HD (style Apple)"
handler.importSource = "umi"
handler.importConfig = {"name": "emojitoimage", "alias": ["emoji2img", "emojiimg", "e2i"], "category": "tools", "description": "Konversi emoji ke gambar HD (style Apple)", "usage": ".emojitoimage <emoji> [style]", "example": ".emojitoimage 😳 apple", "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-tools-emojitoimage": "emojitoimage", "umi-emojitoimage": "emojitoimage", "umi-emoji2img": "emoji2img", "umi-emojiimg": "emojiimg", "umi-e2i": "e2i", "emojitoimage": "emojitoimage", "emoji2img": "emoji2img", "emojiimg": "emojiimg", "e2i": "e2i"}
export default handler
