/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "asyntai", "category": "ai", "aliasMap": {"umi-ai-asyntai": "asyntai", "umi-asyntai": "asyntai", "umi-asynt": "asynt", "umi-asyntai-chat": "asyntai-chat", "asyntai": "asyntai", "asynt": "asynt", "asyntai-chat": "asyntai-chat"}, "description": "Bercakap-cakap dengan AI dari Asynt AI", "usage": ".asyntai <pesan>", "example": ".asyntai Halo, siapa kamu?", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/ai/asyntai.js", metadata, m, extra)
handler.help = ["umi-ai-asyntai <pesan>"]
handler.command = ["umi-ai-asyntai", "umi-asyntai", "umi-asynt", "umi-asyntai-chat", "asyntai", "asynt", "asyntai-chat"]
handler.tags = ["ai"]
handler.description = "Bercakap-cakap dengan AI dari Asynt AI"
handler.importSource = "umi"
handler.importConfig = {"name": "asyntai", "alias": ["asynt", "asyntai-chat"], "category": "ai", "description": "Bercakap-cakap dengan AI dari Asynt AI", "usage": ".asyntai <pesan>", "example": ".asyntai Halo, siapa kamu?", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-ai-asyntai": "asyntai", "umi-asyntai": "asyntai", "umi-asynt": "asynt", "umi-asyntai-chat": "asyntai-chat", "asyntai": "asyntai", "asynt": "asynt", "asyntai-chat": "asyntai-chat"}
export default handler
