import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "clanboss", "category": "clan", "aliasMap": {"umi-clan-clanboss": "clanboss", "umi-clanboss": "clanboss", "umi-bossclan": "bossclan", "umi-clanraidboss": "clanraidboss", "clanboss": "clanboss", "bossclan": "bossclan", "clanraidboss": "clanraidboss"}, "description": "Fight boss clan untuk dapet XP dan reward", "usage": ".clanboss", "example": ".clanboss", "cooldown": 300, "energi": 5}
const handler = (m, extra) => runImportedFeature("umi", "plugins/clan/clanboss.js", metadata, m, extra)
handler.help = ["umi-clan-clanboss"]
handler.command = ["umi-clan-clanboss", "umi-clanboss", "umi-bossclan", "umi-clanraidboss", "clanboss", "bossclan", "clanraidboss"]
handler.tags = ["clan"]
handler.description = "Fight boss clan untuk dapet XP dan reward"
handler.importSource = "umi"
handler.importConfig = {"name": "clanboss", "alias": ["bossclan", "clanraidboss"], "category": "clan", "description": "Fight boss clan untuk dapet XP dan reward", "usage": ".clanboss", "example": ".clanboss", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 300, "energi": 5, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-clan-clanboss": "clanboss", "umi-clanboss": "clanboss", "umi-bossclan": "bossclan", "umi-clanraidboss": "clanraidboss", "clanboss": "clanboss", "bossclan": "bossclan", "clanraidboss": "clanraidboss"}
export default handler
