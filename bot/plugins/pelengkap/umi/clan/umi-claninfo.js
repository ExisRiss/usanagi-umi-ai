import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "claninfo", "category": "clan", "aliasMap": {"umi-clan-claninfo": "claninfo", "umi-claninfo": "claninfo", "umi-infoclan": "infoclan", "umi-myclan": "myclan", "umi-guildinfo": "guildinfo", "claninfo": "claninfo", "infoclan": "infoclan", "myclan": "myclan", "guildinfo": "guildinfo"}, "description": "Lihat info clan", "usage": ".claninfo [clan_id]", "example": ".claninfo", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/clan/claninfo.js", metadata, m, extra)
handler.help = ["umi-clan-claninfo [clan_id]"]
handler.command = ["umi-clan-claninfo", "umi-claninfo", "umi-infoclan", "umi-myclan", "umi-guildinfo", "claninfo", "infoclan", "myclan", "guildinfo"]
handler.tags = ["clan"]
handler.description = "Lihat info clan"
handler.importSource = "umi"
handler.importConfig = {"name": "claninfo", "alias": ["infoclan", "myclan", "guildinfo"], "category": "clan", "description": "Lihat info clan", "usage": ".claninfo [clan_id]", "example": ".claninfo", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-clan-claninfo": "claninfo", "umi-claninfo": "claninfo", "umi-infoclan": "infoclan", "umi-myclan": "myclan", "umi-guildinfo": "guildinfo", "claninfo": "claninfo", "infoclan": "infoclan", "myclan": "myclan", "guildinfo": "guildinfo"}
export default handler
