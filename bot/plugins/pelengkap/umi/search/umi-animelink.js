import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "animelink", "category": "search", "aliasMap": {"umi-search-animelink": "animelink", "umi-animelink": "animelink", "animelink": "animelink"}, "description": "Handler untuk link download anime", "usage": "Internal command", "example": "", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/search/animelink.js", metadata, m, extra)
handler.help = ["umi-search-animelink command"]
handler.command = ["umi-search-animelink", "umi-animelink", "animelink"]
handler.tags = ["search"]
handler.description = "Handler untuk link download anime"
handler.importSource = "umi"
handler.importConfig = {"name": "animelink", "alias": [], "category": "search", "description": "Handler untuk link download anime", "usage": "Internal command", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true, "isHidden": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-search-animelink": "animelink", "umi-animelink": "animelink", "animelink": "animelink"}
export default handler
