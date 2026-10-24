import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "kobo-ai", "category": "ai", "aliasMap": {"umi-ai-kobo-ai": "kobo-ai", "umi-kobo-ai": "kobo-ai", "umi-koboai": "koboai", "umi-kobo": "kobo", "kobo-ai": "kobo-ai", "koboai": "koboai", "kobo": "kobo"}, "description": "Chat dengan Kobo Kanaeru — VTuber Hololive ID", "usage": ".kobo-ai <pertanyaan>", "example": ".kobo-ai Kobo lagi apa?", "cooldown": 10, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/ai/kobo-ai.js", metadata, m, extra)
handler.help = ["umi-ai-kobo-ai <pertanyaan>"]
handler.command = ["umi-ai-kobo-ai", "umi-kobo-ai", "umi-koboai", "umi-kobo", "kobo-ai", "koboai", "kobo"]
handler.tags = ["ai"]
handler.description = "Chat dengan Kobo Kanaeru — VTuber Hololive ID"
handler.importSource = "umi"
handler.importConfig = {"name": "kobo-ai", "alias": ["koboai", "kobo"], "category": "ai", "description": "Chat dengan Kobo Kanaeru — VTuber Hololive ID", "usage": ".kobo-ai <pertanyaan>", "example": ".kobo-ai Kobo lagi apa?", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-ai-kobo-ai": "kobo-ai", "umi-kobo-ai": "kobo-ai", "umi-koboai": "koboai", "umi-kobo": "kobo", "kobo-ai": "kobo-ai", "koboai": "koboai", "kobo": "kobo"}
export default handler
