import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "mortalkombat", "category": "game", "aliasMap": {"umi-game-mortalkombat": "mortalkombat", "umi-mortalkombat": "mortalkombat", "umi-mortal": "mortal", "umi-mk": "mk", "mortalkombat": "mortalkombat", "mortal": "mortal", "mk": "mk"}, "description": "Mortal Kombat mini - fight 1 vs 1!", "usage": "", "example": ".mk", "cooldown": 5}
const handler = (m, extra) => runImportedFeature("umi", "plugins/game/mortal_kombat.js", metadata, m, extra)
handler.help = ["umi-game-mortalkombat"]
handler.command = ["umi-game-mortalkombat", "umi-mortalkombat", "umi-mortal", "umi-mk", "mortalkombat", "mortal", "mk"]
handler.tags = ["game"]
handler.description = "Mortal Kombat mini - fight 1 vs 1!"
handler.importSource = "umi"
handler.importConfig = {"name": "mortalkombat", "alias": ["mortal", "mk"], "category": "game", "description": "Mortal Kombat mini - fight 1 vs 1!", "usage": "", "example": ".mk", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-game-mortalkombat": "mortalkombat", "umi-mortalkombat": "mortalkombat", "umi-mortal": "mortal", "umi-mk": "mk", "mortalkombat": "mortalkombat", "mortal": "mortal", "mk": "mk"}
export default handler
