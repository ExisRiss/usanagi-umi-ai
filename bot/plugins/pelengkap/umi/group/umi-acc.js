import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "acc", "category": "group", "aliasMap": {"umi-group-acc": "acc", "umi-acc": "acc", "umi-accall": "accall", "umi-joinrequest": "joinrequest", "umi-reqjoin": "reqjoin", "acc": "acc", "accall": "accall", "joinrequest": "joinrequest", "reqjoin": "reqjoin"}, "description": "Kelola permintaan masuk grup (accept/reject)", "usage": ".acc <list|approve|reject> [all|nomor]", "example": ".acc approve all", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/acc.js", metadata, m, extra)
handler.help = ["umi-group-acc <list|approve|reject> [all|nomor]"]
handler.command = ["umi-group-acc", "umi-acc", "umi-accall", "umi-joinrequest", "umi-reqjoin", "acc", "accall", "joinrequest", "reqjoin"]
handler.tags = ["group"]
handler.description = "Kelola permintaan masuk grup (accept/reject)"
handler.importSource = "umi"
handler.importConfig = {"name": "acc", "alias": ["accall", "joinrequest", "reqjoin"], "category": "group", "description": "Kelola permintaan masuk grup (accept/reject)", "usage": ".acc <list|approve|reject> [all|nomor]", "example": ".acc approve all", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "isAdmin": true, "isBotAdmin": true, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = true
handler.botAdmin = true
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-acc": "acc", "umi-acc": "acc", "umi-accall": "accall", "umi-joinrequest": "joinrequest", "umi-reqjoin": "reqjoin", "acc": "acc", "accall": "accall", "joinrequest": "joinrequest", "reqjoin": "reqjoin"}
export default handler
