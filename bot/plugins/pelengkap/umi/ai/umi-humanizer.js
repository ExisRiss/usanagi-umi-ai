/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "humanize", "category": "ai", "aliasMap": {"umi-ai-humanize": "humanize", "umi-humanize": "humanize", "umi-humanizer": "humanizer", "umi-aihumanize": "aihumanize", "umi-zerogpt": "zerogpt", "humanize": "humanize", "humanizer": "humanizer", "aihumanize": "aihumanize", "zerogpt": "zerogpt"}, "description": "Ubah teks AI-generated jadi lebih natural (Humanized)", "usage": ".humanize <teks> (atau reply teks)", "example": ".humanize Berdasarkan analisis yang mendalam...", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/ai/humanizer.js", metadata, m, extra)
handler.help = ["umi-ai-humanize <teks> (atau reply teks)"]
handler.command = ["umi-ai-humanize", "umi-humanize", "umi-humanizer", "umi-aihumanize", "umi-zerogpt", "humanize", "humanizer", "aihumanize", "zerogpt"]
handler.tags = ["ai"]
handler.description = "Ubah teks AI-generated jadi lebih natural (Humanized)"
handler.importSource = "umi"
handler.importConfig = {"name": "humanize", "alias": ["humanizer", "aihumanize", "zerogpt"], "category": "ai", "description": "Ubah teks AI-generated jadi lebih natural (Humanized)", "usage": ".humanize <teks> (atau reply teks)", "example": ".humanize Berdasarkan analisis yang mendalam...", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-ai-humanize": "humanize", "umi-humanize": "humanize", "umi-humanizer": "humanizer", "umi-aihumanize": "aihumanize", "umi-zerogpt": "zerogpt", "humanize": "humanize", "humanizer": "humanizer", "aihumanize": "aihumanize", "zerogpt": "zerogpt"}
export default handler
