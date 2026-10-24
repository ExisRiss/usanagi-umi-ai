import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "ytsummarize", "category": "tools", "aliasMap": {"umi-tools-ytsummarize": "ytsummarize", "umi-ytsummarize": "ytsummarize", "umi-ytsummary": "ytsummary", "umi-summarizeyt": "summarizeyt", "umi-ringkasyt": "ringkasyt", "ytsummarize": "ytsummarize", "ytsummary": "ytsummary", "summarizeyt": "summarizeyt", "ringkasyt": "ringkasyt"}, "description": "Ringkasan video YouTube dengan AI", "usage": ".ytsummarize <url>", "example": ".ytsummarize https://youtu.be/xxxxx", "cooldown": 60, "energi": 3}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/ytsummarize.js", metadata, m, extra)
handler.help = ["umi-tools-ytsummarize <url>"]
handler.command = ["umi-tools-ytsummarize", "umi-ytsummarize", "umi-ytsummary", "umi-summarizeyt", "umi-ringkasyt", "ytsummarize", "ytsummary", "summarizeyt", "ringkasyt"]
handler.tags = ["tools"]
handler.description = "Ringkasan video YouTube dengan AI"
handler.importSource = "umi"
handler.importConfig = {"name": "ytsummarize", "alias": ["ytsummary", "summarizeyt", "ringkasyt"], "category": "tools", "description": "Ringkasan video YouTube dengan AI", "usage": ".ytsummarize <url>", "example": ".ytsummarize https://youtu.be/xxxxx", "isOwner": false, "isPremium": true, "isGroup": false, "isPrivate": false, "cooldown": 60, "energi": 3, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = true
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-tools-ytsummarize": "ytsummarize", "umi-ytsummarize": "ytsummarize", "umi-ytsummary": "ytsummary", "umi-summarizeyt": "summarizeyt", "umi-ringkasyt": "ringkasyt", "ytsummarize": "ytsummarize", "ytsummary": "ytsummary", "summarizeyt": "summarizeyt", "ringkasyt": "ringkasyt"}
export default handler
