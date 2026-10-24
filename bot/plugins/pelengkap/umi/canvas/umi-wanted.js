import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "wanted", "category": "maker", "aliasMap": {"umi-maker-wanted": "wanted", "umi-wanted": "wanted", "umi-wantedposter": "wantedposter", "wantedposter": "wantedposter"}, "description": "Efek poster wanted", "usage": ".wanted (reply foto)", "example": ".wanted", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/wanted.js", metadata, m, extra)
handler.help = ["umi-maker-wanted (reply foto)"]
handler.command = ["umi-maker-wanted", "umi-wanted", "umi-wantedposter", "wantedposter"]
handler.tags = ["maker"]
handler.description = "Efek poster wanted"
handler.importSource = "umi"
handler.importConfig = {"name": "wanted", "alias": ["wantedposter"], "category": "maker", "description": "Efek poster wanted", "usage": ".wanted (reply foto)", "example": ".wanted", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-maker-wanted": "wanted", "umi-wanted": "wanted", "umi-wantedposter": "wantedposter", "wantedposter": "wantedposter"}
export default handler
