/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "aisantai", "category": "ai", "aliasMap": {"umi-ai-aisantai": "aisantai", "umi-aisantai": "aisantai", "umi-ceai": "ceai", "umi-chateverywhere": "chateverywhere", "umi-ce": "ce", "umi-chatgpt": "chatgpt", "aisantai": "aisantai", "ceai": "ceai", "chateverywhere": "chateverywhere", "ce": "ce", "chatgpt": "chatgpt"}, "description": "Chat dengan AI santai (ChatEverywhere)", "usage": ".aisantai <pesan>", "example": ".aisantai Halo bro", "cooldown": 5, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/ai/aisantai.js", metadata, m, extra)
handler.help = ["umi-ai-aisantai <pesan>"]
handler.command = ["umi-ai-aisantai", "umi-aisantai", "umi-ceai", "umi-chateverywhere", "umi-ce", "umi-chatgpt", "aisantai", "ceai", "chateverywhere", "ce", "chatgpt"]
handler.tags = ["ai"]
handler.description = "Chat dengan AI santai (ChatEverywhere)"
handler.importSource = "umi"
handler.importConfig = {"name": "aisantai", "alias": ["ceai", "chateverywhere", "ce", "chatgpt"], "category": "ai", "description": "Chat dengan AI santai (ChatEverywhere)", "usage": ".aisantai <pesan>", "example": ".aisantai Halo bro", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-ai-aisantai": "aisantai", "umi-aisantai": "aisantai", "umi-ceai": "ceai", "umi-chateverywhere": "chateverywhere", "umi-ce": "ce", "umi-chatgpt": "chatgpt", "aisantai": "aisantai", "ceai": "ceai", "chateverywhere": "chateverywhere", "ce": "ce", "chatgpt": "chatgpt"}
export default handler
