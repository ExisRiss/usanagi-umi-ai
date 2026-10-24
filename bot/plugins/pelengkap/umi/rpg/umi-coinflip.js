import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "coinflip", "category": "rpg", "aliasMap": {"umi-rpg-coinflip": "coinflip", "umi-coinflip": "coinflip", "umi-cf": "cf", "umi-flip": "flip", "umi-toss": "toss"}, "description": "Gambling coin flip", "usage": ".coinflip <heads/tails> <bet>", "example": ".coinflip heads 5000", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/coinflip.js", metadata, m, extra)
handler.help = ["umi-rpg-coinflip <heads/tails> <bet>"]
handler.command = ["umi-rpg-coinflip", "umi-coinflip", "umi-cf", "umi-flip", "umi-toss"]
handler.tags = ["rpg"]
handler.description = "Gambling coin flip"
handler.importSource = "umi"
handler.importConfig = {"name": "coinflip", "alias": ["cf", "flip", "toss"], "category": "rpg", "description": "Gambling coin flip", "usage": ".coinflip <heads/tails> <bet>", "example": ".coinflip heads 5000", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-rpg-coinflip": "coinflip", "umi-coinflip": "coinflip", "umi-cf": "cf", "umi-flip": "flip", "umi-toss": "toss"}
export default handler
