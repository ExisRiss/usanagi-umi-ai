import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "suppbypass", "category": "tools", "aliasMap": {"umi-tools-suppbypass": "suppbypass", "umi-suppbypass": "suppbypass", "umi-supportbypass": "supportbypass", "umi-bypasslist": "bypasslist", "umi-listbypass": "listbypass", "suppbypass": "suppbypass", "supportbypass": "supportbypass", "bypasslist": "bypasslist", "listbypass": "listbypass"}, "description": "List shortlink yang bisa di-bypass", "usage": ".suppbypass", "example": ".suppbypass", "cooldown": 5}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/suppbypass.js", metadata, m, extra)
handler.help = ["umi-tools-suppbypass"]
handler.command = ["umi-tools-suppbypass", "umi-suppbypass", "umi-supportbypass", "umi-bypasslist", "umi-listbypass", "suppbypass", "supportbypass", "bypasslist", "listbypass"]
handler.tags = ["tools"]
handler.description = "List shortlink yang bisa di-bypass"
handler.importSource = "umi"
handler.importConfig = {"name": "suppbypass", "alias": ["supportbypass", "bypasslist", "listbypass"], "category": "tools", "description": "List shortlink yang bisa di-bypass", "usage": ".suppbypass", "example": ".suppbypass", "isOwner": false, "isPremium": false, "cooldown": 5, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-tools-suppbypass": "suppbypass", "umi-suppbypass": "suppbypass", "umi-supportbypass": "supportbypass", "umi-bypasslist": "bypasslist", "umi-listbypass": "listbypass", "suppbypass": "suppbypass", "supportbypass": "supportbypass", "bypasslist": "bypasslist", "listbypass": "listbypass"}
export default handler
