import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "q", "category": "tools", "aliasMap": {"umi-tools-q": "q", "umi-q": "q", "umi-quoted": "quoted", "q": "q", "inspect": "inspect"}, "description": "Ambil JSON message dari pesan yang direply", "usage": ".q (reply pesan)", "cooldown": 3}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/q.js", metadata, m, extra)
handler.help = ["umi-tools-q (reply pesan)"]
handler.command = ["umi-tools-q", "umi-q", "umi-quoted", "q", "inspect"]
handler.tags = ["tools"]
handler.description = "Ambil JSON message dari pesan yang direply"
handler.importSource = "umi"
handler.importConfig = {"name": "q", "alias": ["quoted", "inspect"], "category": "tools", "description": "Ambil JSON message dari pesan yang direply", "usage": ".q (reply pesan)", "isOwner": true, "cooldown": 3, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-tools-q": "q", "umi-q": "q", "umi-quoted": "quoted", "q": "q", "inspect": "inspect"}
export default handler
