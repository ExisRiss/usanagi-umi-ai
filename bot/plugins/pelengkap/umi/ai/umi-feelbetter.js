/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "feelbetter", "category": "ai", "aliasMap": {"umi-ai-feelbetter": "feelbetter", "umi-feelbetter": "feelbetter", "umi-feelbetterbot": "feelbetterbot", "umi-healing": "healing", "feelbetter": "feelbetter", "feelbetterbot": "feelbetterbot", "healing": "healing"}, "description": "Chat dengan FeelBetterBot — AI yang siap mendengarkan tanpa menghakimi", "usage": ".feelbetter <curhat/pertanyaan>", "example": ".feelbetter lagi sedih nih", "cooldown": 10, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/ai/feelbetter.js", metadata, m, extra)
handler.help = ["umi-ai-feelbetter <curhat/pertanyaan>"]
handler.command = ["umi-ai-feelbetter", "umi-feelbetter", "umi-feelbetterbot", "umi-healing", "feelbetter", "feelbetterbot", "healing"]
handler.tags = ["ai"]
handler.description = "Chat dengan FeelBetterBot — AI yang siap mendengarkan tanpa menghakimi"
handler.importSource = "umi"
handler.importConfig = {"name": "feelbetter", "alias": ["fb", "feelbetterbot", "healing"], "category": "ai", "description": "Chat dengan FeelBetterBot — AI yang siap mendengarkan tanpa menghakimi", "usage": ".feelbetter <curhat/pertanyaan>", "example": ".feelbetter lagi sedih nih", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-ai-feelbetter": "feelbetter", "umi-feelbetter": "feelbetter", "umi-feelbetterbot": "feelbetterbot", "umi-healing": "healing", "feelbetter": "feelbetter", "feelbetterbot": "feelbetterbot", "healing": "healing"}
export default handler
