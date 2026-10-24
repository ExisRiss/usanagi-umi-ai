import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "poll", "category": "group", "aliasMap": {"umi-group-poll": "poll", "umi-voting": "voting", "umi-vote": "vote", "poll": "poll", "voting": "voting"}, "description": "Buat polling/voting di grup", "usage": ".poll <pertanyaan> | <opsi1>, <opsi2>, ...", "example": ".poll Makan apa? | Nasi Goreng, Mie Ayam, Bakso", "cooldown": 30, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/poll.js", metadata, m, extra)
handler.help = ["umi-group-poll <pertanyaan> | <opsi1>, <opsi2>, ..."]
handler.command = ["umi-group-poll", "umi-voting", "umi-vote", "poll", "voting"]
handler.tags = ["group"]
handler.description = "Buat polling/voting di grup"
handler.importSource = "umi"
handler.importConfig = {"name": "poll", "alias": ["voting", "vote", "survei"], "category": "group", "description": "Buat polling/voting di grup", "usage": ".poll <pertanyaan> | <opsi1>, <opsi2>, ...", "example": ".poll Makan apa? | Nasi Goreng, Mie Ayam, Bakso", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 30, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-group-poll": "poll", "umi-voting": "voting", "umi-vote": "vote", "poll": "poll", "voting": "voting"}
export default handler
