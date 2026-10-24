import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "sulap", "category": "fun", "aliasMap": {"umi-fun-sulap": "sulap", "umi-sulap": "sulap", "umi-magic": "magic", "umi-magictrick": "magictrick", "magictrick": "magictrick"}, "description": "Pertunjukan sulap - kick member secara dramatis", "usage": ".sulap", "example": ".sulap", "cooldown": 60, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/fun/sulap.js", metadata, m, extra)
handler.help = ["umi-fun-sulap"]
handler.command = ["umi-fun-sulap", "umi-sulap", "umi-magic", "umi-magictrick", "magictrick"]
handler.tags = ["fun"]
handler.description = "Pertunjukan sulap - kick member secara dramatis"
handler.importSource = "umi"
handler.importConfig = {"name": "sulap", "alias": ["magic", "magictrick"], "category": "fun", "description": "Pertunjukan sulap - kick member secara dramatis", "usage": ".sulap", "example": ".sulap", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 60, "energi": 0, "isEnabled": true, "isAdmin": true, "isBotAdmin": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = true
handler.botAdmin = true
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-fun-sulap": "sulap", "umi-sulap": "sulap", "umi-magic": "magic", "umi-magictrick": "magictrick", "magictrick": "magictrick"}
export default handler
