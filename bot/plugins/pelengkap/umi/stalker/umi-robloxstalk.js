/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "robloxstalk", "category": "stalker", "aliasMap": {"umi-stalker-robloxstalk": "robloxstalk", "umi-robloxstalk": "robloxstalk", "umi-rblxstalk": "rblxstalk", "umi-rbxstalk": "rbxstalk", "umi-stalkroblox": "stalkroblox", "umi-stalkrbx": "stalkrbx", "robloxstalk": "robloxstalk", "rblxstalk": "rblxstalk", "rbxstalk": "rbxstalk", "stalkroblox": "stalkroblox", "stalkrbx": "stalkrbx"}, "description": "Stalk akun Roblox berdasarkan username", "usage": ".robloxstalk <username>", "example": ".robloxstalk Linkmon99", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/stalker/robloxstalk.js", metadata, m, extra)
handler.help = ["umi-stalker-robloxstalk <username>"]
handler.command = ["umi-stalker-robloxstalk", "umi-robloxstalk", "umi-rblxstalk", "umi-rbxstalk", "umi-stalkroblox", "umi-stalkrbx", "robloxstalk", "rblxstalk", "rbxstalk", "stalkroblox", "stalkrbx"]
handler.tags = ["stalker"]
handler.description = "Stalk akun Roblox berdasarkan username"
handler.importSource = "umi"
handler.importConfig = {"name": "robloxstalk", "alias": ["rblxstalk", "rbxstalk", "stalkroblox", "stalkrbx"], "category": "stalker", "description": "Stalk akun Roblox berdasarkan username", "usage": ".robloxstalk <username>", "example": ".robloxstalk Linkmon99", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-stalker-robloxstalk": "robloxstalk", "umi-robloxstalk": "robloxstalk", "umi-rblxstalk": "rblxstalk", "umi-rbxstalk": "rbxstalk", "umi-stalkroblox": "stalkroblox", "umi-stalkrbx": "stalkrbx", "robloxstalk": "robloxstalk", "rblxstalk": "rblxstalk", "rbxstalk": "rbxstalk", "stalkroblox": "stalkroblox", "stalkrbx": "stalkrbx"}
export default handler
