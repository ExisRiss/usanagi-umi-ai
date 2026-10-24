import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "randomtag", "category": "group", "aliasMap": {"umi-group-randomtag": "randomtag", "umi-randomtag": "randomtag", "umi-rtag": "rtag", "randomtag": "randomtag", "rtag": "rtag"}, "description": "Tag member random di group", "usage": ".randomtag", "example": ".randomtag", "cooldown": 10, "energi": 5}
const handler = (m, extra) => runImportedFeature("umi", "plugins/fun/randomtag.js", metadata, m, extra)
handler.help = ["umi-group-randomtag"]
handler.command = ["umi-group-randomtag", "umi-randomtag", "umi-rtag", "randomtag", "rtag"]
handler.tags = ["group"]
handler.description = "Tag member random di group"
handler.importSource = "umi"
handler.importConfig = {"name": "randomtag", "alias": ["rtag"], "category": "group", "description": "Tag member random di group", "usage": ".randomtag", "example": ".randomtag", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 10, "energi": 5, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-group-randomtag": "randomtag", "umi-randomtag": "randomtag", "umi-rtag": "rtag", "randomtag": "randomtag", "rtag": "rtag"}
export default handler
