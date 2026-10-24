import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "dramabox", "category": "search", "aliasMap": {"umi-search-dramabox": "dramabox", "umi-dramabox": "dramabox", "umi-drama": "drama", "umi-dramasearch": "dramasearch", "dramabox": "dramabox", "drama": "drama", "dramasearch": "dramasearch"}, "description": "Cari drama di DramaBox", "usage": ".dramabox <query>", "example": ".dramabox billionaire", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/search/dramabox.js", metadata, m, extra)
handler.help = ["umi-search-dramabox <query>"]
handler.command = ["umi-search-dramabox", "umi-dramabox", "umi-drama", "umi-dramasearch", "dramabox", "drama", "dramasearch"]
handler.tags = ["search"]
handler.description = "Cari drama di DramaBox"
handler.importSource = "umi"
handler.importConfig = {"name": "dramabox", "alias": ["drama", "dramasearch"], "category": "search", "description": "Cari drama di DramaBox", "usage": ".dramabox <query>", "example": ".dramabox billionaire", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-search-dramabox": "dramabox", "umi-dramabox": "dramabox", "umi-drama": "drama", "umi-dramasearch": "dramasearch", "dramabox": "dramabox", "drama": "drama", "dramasearch": "dramasearch"}
export default handler
