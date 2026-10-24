import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "pet", "category": "rpg", "aliasMap": {"umi-rpg-pet": "pet", "umi-pet": "pet", "umi-mypet": "mypet", "umi-hewanku": "hewanku", "umi-peliharaan": "peliharaan"}, "description": "Kelola pet/hewan peliharaan", "usage": ".pet <feed/train/status>", "example": ".pet status", "cooldown": 10, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/pet.js", metadata, m, extra)
handler.help = ["umi-rpg-pet <feed/train/status>"]
handler.command = ["umi-rpg-pet", "umi-pet", "umi-mypet", "umi-hewanku", "umi-peliharaan"]
handler.tags = ["rpg"]
handler.description = "Kelola pet/hewan peliharaan"
handler.importSource = "umi"
handler.importConfig = {"name": "pet", "alias": ["mypet", "hewanku", "peliharaan"], "category": "rpg", "description": "Kelola pet/hewan peliharaan", "usage": ".pet <feed/train/status>", "example": ".pet status", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-rpg-pet": "pet", "umi-pet": "pet", "umi-mypet": "mypet", "umi-hewanku": "hewanku", "umi-peliharaan": "peliharaan"}
export default handler
