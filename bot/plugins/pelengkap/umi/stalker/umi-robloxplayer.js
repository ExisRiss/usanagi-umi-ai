import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "robloxplayer", "category": "stalker", "aliasMap": {"umi-stalker-robloxplayer": "robloxplayer", "umi-robloxplayer": "robloxplayer", "umi-robloxsearch": "robloxsearch", "umi-searchroblox": "searchroblox", "umi-robloxfind": "robloxfind", "robloxplayer": "robloxplayer", "robloxsearch": "robloxsearch", "searchroblox": "searchroblox", "robloxfind": "robloxfind"}, "description": "Search Roblox player by username", "usage": ".robloxplayer <username>", "example": ".robloxplayer linkmon", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/stalker/robloxplayer.js", metadata, m, extra)
handler.help = ["umi-stalker-robloxplayer <username>"]
handler.command = ["umi-stalker-robloxplayer", "umi-robloxplayer", "umi-robloxsearch", "umi-searchroblox", "umi-robloxfind", "robloxplayer", "robloxsearch", "searchroblox", "robloxfind"]
handler.tags = ["stalker"]
handler.description = "Search Roblox player by username"
handler.importSource = "umi"
handler.importConfig = {"name": "robloxplayer", "alias": ["robloxsearch", "searchroblox", "robloxfind"], "category": "stalker", "description": "Search Roblox player by username", "usage": ".robloxplayer <username>", "example": ".robloxplayer linkmon", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-stalker-robloxplayer": "robloxplayer", "umi-robloxplayer": "robloxplayer", "umi-robloxsearch": "robloxsearch", "umi-searchroblox": "searchroblox", "umi-robloxfind": "robloxfind", "robloxplayer": "robloxplayer", "robloxsearch": "robloxsearch", "searchroblox": "searchroblox", "robloxfind": "robloxfind"}
export default handler
