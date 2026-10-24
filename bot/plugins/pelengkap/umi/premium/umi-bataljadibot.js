import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "bataljadibot", "category": "premium", "aliasMap": {"umi-premium-bataljadibot": "bataljadibot", "umi-bataljadibot": "bataljadibot", "umi-canceljadibot": "canceljadibot", "umi-stopjadibotstart": "stopjadibotstart", "bataljadibot": "bataljadibot", "canceljadibot": "canceljadibot", "stopjadibotstart": "stopjadibotstart"}, "description": "Batalkan proses jadibot yang sedang dimulai", "usage": ".bataljadibot", "example": ".bataljadibot", "cooldown": 5}
const handler = (m, extra) => runImportedFeature("umi", "plugins/premium/bataljadibot.js", metadata, m, extra)
handler.help = ["umi-premium-bataljadibot"]
handler.command = ["umi-premium-bataljadibot", "umi-bataljadibot", "umi-canceljadibot", "umi-stopjadibotstart", "bataljadibot", "canceljadibot", "stopjadibotstart"]
handler.tags = ["premium"]
handler.description = "Batalkan proses jadibot yang sedang dimulai"
handler.importSource = "umi"
handler.importConfig = {"name": "bataljadibot", "alias": ["canceljadibot", "stopjadibotstart"], "category": "premium", "description": "Batalkan proses jadibot yang sedang dimulai", "usage": ".bataljadibot", "example": ".bataljadibot", "isOwner": false, "isPremium": true, "isGroup": false, "cooldown": 5, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = true
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-premium-bataljadibot": "bataljadibot", "umi-bataljadibot": "bataljadibot", "umi-canceljadibot": "canceljadibot", "umi-stopjadibotstart": "stopjadibotstart", "bataljadibot": "bataljadibot", "canceljadibot": "canceljadibot", "stopjadibotstart": "stopjadibotstart"}
export default handler
