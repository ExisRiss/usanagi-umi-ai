import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "mangaread", "category": "search", "aliasMap": {"umi-search-mangaread": "mangaread", "umi-mangaread": "mangaread", "umi-mread": "mread", "umi-readmanga": "readmanga", "umi-bacamanga": "bacamanga", "mangaread": "mangaread", "mread": "mread", "readmanga": "readmanga", "bacamanga": "bacamanga"}, "description": "Membaca manga dari Shinigami", "usage": ".mangaread <url atau id>", "example": ".mangaread https://g.shinigami.asia/chapter/0a338442-9b00-4c4a-b80e-93ce34cd0cd0", "cooldown": 15, "energi": 5}
const handler = (m, extra) => runImportedFeature("umi", "plugins/search/mangaread.js", metadata, m, extra)
handler.help = ["umi-search-mangaread <url atau id>"]
handler.command = ["umi-search-mangaread", "umi-mangaread", "umi-mread", "umi-readmanga", "umi-bacamanga", "mangaread", "mread", "readmanga", "bacamanga"]
handler.tags = ["search"]
handler.description = "Membaca manga dari Shinigami"
handler.importSource = "umi"
handler.importConfig = {"name": "mangaread", "alias": ["mread", "readmanga", "bacamanga"], "category": "search", "description": "Membaca manga dari Shinigami", "usage": ".mangaread <url atau id>", "example": ".mangaread https://g.shinigami.asia/chapter/0a338442-9b00-4c4a-b80e-93ce34cd0cd0", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 15, "energi": 5, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-search-mangaread": "mangaread", "umi-mangaread": "mangaread", "umi-mread": "mread", "umi-readmanga": "readmanga", "umi-bacamanga": "bacamanga", "mangaread": "mangaread", "mread": "mread", "readmanga": "readmanga", "bacamanga": "bacamanga"}
export default handler
