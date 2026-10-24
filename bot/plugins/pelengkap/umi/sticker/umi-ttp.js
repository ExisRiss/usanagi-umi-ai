/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "ttp", "category": "maker", "aliasMap": {"umi-maker-ttp": "ttp", "umi-ttp": "ttp", "umi-texttopicture": "texttopicture", "ttp": "ttp", "texttopicture": "texttopicture"}, "description": "Membuat stiker keren dari teks", "usage": ".ttp <teks>", "example": ".ttp Hai Cantik", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/sticker/ttp.js", metadata, m, extra)
handler.help = ["umi-maker-ttp <teks>"]
handler.command = ["umi-maker-ttp", "umi-ttp", "umi-texttopicture", "ttp", "texttopicture"]
handler.tags = ["maker"]
handler.description = "Membuat stiker keren dari teks"
handler.importSource = "umi"
handler.importConfig = {"name": "ttp", "alias": ["texttopicture"], "category": "maker", "description": "Membuat stiker keren dari teks", "usage": ".ttp <teks>", "example": ".ttp Hai Cantik", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-maker-ttp": "ttp", "umi-ttp": "ttp", "umi-texttopicture": "texttopicture", "ttp": "ttp", "texttopicture": "texttopicture"}
export default handler
