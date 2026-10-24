import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "dafont", "category": "search", "aliasMap": {"umi-search-dafont": "dafont", "umi-nerdfont": "nerdfont", "dafont": "dafont", "nerdfont": "nerdfont", "font": "font"}, "description": "Cari font di DaFont", "usage": ".dafont <query>", "example": ".dafont Coolvetica", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/search/nerdfont.js", metadata, m, extra)
handler.help = ["umi-search-dafont <query>"]
handler.command = ["umi-search-dafont", "umi-nerdfont", "dafont", "nerdfont", "font"]
handler.tags = ["search"]
handler.description = "Cari font di DaFont"
handler.importSource = "umi"
handler.importConfig = {"name": "dafont", "alias": ["nerdfont", "font"], "category": "search", "description": "Cari font di DaFont", "usage": ".dafont <query>", "example": ".dafont Coolvetica", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-search-dafont": "dafont", "umi-nerdfont": "nerdfont", "dafont": "dafont", "nerdfont": "nerdfont", "font": "font"}
export default handler
