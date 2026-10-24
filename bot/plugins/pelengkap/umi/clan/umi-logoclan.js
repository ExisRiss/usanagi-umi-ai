import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "clanlogo", "category": "clan", "aliasMap": {"umi-clan-clanlogo": "clanlogo", "umi-clanlogo": "clanlogo", "umi-setlogo": "setlogo", "umi-clanicon": "clanicon", "clanlogo": "clanlogo", "setlogo": "setlogo", "clanicon": "clanicon"}, "description": "Set logo clan (reply gambar)", "usage": ".clanlogo (reply gambar)", "example": ".clanlogo", "cooldown": 20, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/clan/logoclan.js", metadata, m, extra)
handler.help = ["umi-clan-clanlogo (reply gambar)"]
handler.command = ["umi-clan-clanlogo", "umi-clanlogo", "umi-setlogo", "umi-clanicon", "clanlogo", "setlogo", "clanicon"]
handler.tags = ["clan"]
handler.description = "Set logo clan (reply gambar)"
handler.importSource = "umi"
handler.importConfig = {"name": "clanlogo", "alias": ["setlogo", "clanicon"], "category": "clan", "description": "Set logo clan (reply gambar)", "usage": ".clanlogo (reply gambar)", "example": ".clanlogo", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 20, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-clan-clanlogo": "clanlogo", "umi-clanlogo": "clanlogo", "umi-setlogo": "setlogo", "umi-clanicon": "clanicon", "clanlogo": "clanlogo", "setlogo": "setlogo", "clanicon": "clanicon"}
export default handler
