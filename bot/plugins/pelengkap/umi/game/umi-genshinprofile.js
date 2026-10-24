import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "genshinprofile", "category": "game", "aliasMap": {"umi-game-genshinprofile": "genshinprofile", "umi-genshinprofile": "genshinprofile", "genshinprofile": "genshinprofile"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/game/genshinprofile.js", metadata, m, extra)
handler.help = ["umi-game-genshinprofile"]
handler.command = ["umi-game-genshinprofile", "umi-genshinprofile", "genshinprofile"]
handler.tags = ["game"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "genshinprofile", "alias": [], "category": "game", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-game-genshinprofile": "genshinprofile", "umi-genshinprofile": "genshinprofile", "genshinprofile": "genshinprofile"}
export default handler
