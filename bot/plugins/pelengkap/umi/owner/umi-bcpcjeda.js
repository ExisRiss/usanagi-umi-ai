import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "bcpcjeda", "category": "owner", "aliasMap": {"umi-owner-bcpcjeda": "bcpcjeda", "umi-bcpcjeda": "bcpcjeda", "umi-delaybcpc": "delaybcpc", "umi-jedabcpc": "jedabcpc", "umi-setjedabcpc": "setjedabcpc", "bcpcjeda": "bcpcjeda", "delaybcpc": "delaybcpc", "jedabcpc": "jedabcpc", "setjedabcpc": "setjedabcpc"}, "description": "Atur jeda broadcast private chat", "usage": ".bcpcjeda <waktu> (contoh: 5s, 2m, 1h)", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/bcpcjeda.js", metadata, m, extra)
handler.help = ["umi-owner-bcpcjeda <waktu> (contoh: 5s, 2m, 1h)"]
handler.command = ["umi-owner-bcpcjeda", "umi-bcpcjeda", "umi-delaybcpc", "umi-jedabcpc", "umi-setjedabcpc", "bcpcjeda", "delaybcpc", "jedabcpc", "setjedabcpc"]
handler.tags = ["owner"]
handler.description = "Atur jeda broadcast private chat"
handler.importSource = "umi"
handler.importConfig = {"name": "bcpcjeda", "alias": ["delaybcpc", "jedabcpc", "setjedabcpc"], "category": "owner", "description": "Atur jeda broadcast private chat", "usage": ".bcpcjeda <waktu> (contoh: 5s, 2m, 1h)", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-bcpcjeda": "bcpcjeda", "umi-bcpcjeda": "bcpcjeda", "umi-delaybcpc": "delaybcpc", "umi-jedabcpc": "jedabcpc", "umi-setjedabcpc": "setjedabcpc", "bcpcjeda": "bcpcjeda", "delaybcpc": "delaybcpc", "jedabcpc": "jedabcpc", "setjedabcpc": "setjedabcpc"}
export default handler
