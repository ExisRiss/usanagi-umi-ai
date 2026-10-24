/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "emojitoanimasi", "category": "tools", "aliasMap": {"umi-tools-emojitoanimasi": "emojitoanimasi", "umi-emojitoanimasi": "emojitoanimasi", "umi-emoji2sticker": "emoji2sticker", "umi-emojisticker": "emojisticker", "umi-e2s": "e2s", "emojitoanimasi": "emojitoanimasi", "emoji2sticker": "emoji2sticker", "emojisticker": "emojisticker", "e2s": "e2s"}, "description": "Konversi emoji ke sticker animasi", "usage": ".emojitoanimasi <emoji>", "example": ".emojitoanimasi 😳", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/emojitoanimasi.js", metadata, m, extra)
handler.help = ["umi-tools-emojitoanimasi <emoji>"]
handler.command = ["umi-tools-emojitoanimasi", "umi-emojitoanimasi", "umi-emoji2sticker", "umi-emojisticker", "umi-e2s", "emojitoanimasi", "emoji2sticker", "emojisticker", "e2s"]
handler.tags = ["tools"]
handler.description = "Konversi emoji ke sticker animasi"
handler.importSource = "umi"
handler.importConfig = {"name": "emojitoanimasi", "alias": ["emoji2sticker", "emojisticker", "e2s"], "category": "tools", "description": "Konversi emoji ke sticker animasi", "usage": ".emojitoanimasi <emoji>", "example": ".emojitoanimasi 😳", "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-tools-emojitoanimasi": "emojitoanimasi", "umi-emojitoanimasi": "emojitoanimasi", "umi-emoji2sticker": "emoji2sticker", "umi-emojisticker": "emojisticker", "umi-e2s": "e2s", "emojitoanimasi": "emojitoanimasi", "emoji2sticker": "emoji2sticker", "emojisticker": "emojisticker", "e2s": "e2s"}
export default handler
