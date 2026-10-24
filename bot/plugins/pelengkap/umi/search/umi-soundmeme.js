import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "soundmeme2", "category": "search", "aliasMap": {"umi-search-soundmeme2": "soundmeme2", "umi-soundmeme2": "soundmeme2", "soundmeme2": "soundmeme2"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/search/soundmeme.js", metadata, m, extra)
handler.help = ["umi-search-soundmeme2"]
handler.command = ["umi-search-soundmeme2", "umi-soundmeme2", "soundmeme2"]
handler.tags = ["search"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "soundmeme2", "alias": [], "category": "search", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-search-soundmeme2": "soundmeme2", "umi-soundmeme2": "soundmeme2", "soundmeme2": "soundmeme2"}
export default handler
