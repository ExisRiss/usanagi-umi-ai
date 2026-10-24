/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "husbu", "category": "random", "aliasMap": {"umi-random-husbu": "husbu", "umi-husbu": "husbu", "umi-husbando": "husbando", "husbu": "husbu", "husbando": "husbando"}, "description": "Random gambar husbu/husbando anime", "usage": ".husbu", "example": ".husbu", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/random/husbu.js", metadata, m, extra)
handler.help = ["umi-random-husbu"]
handler.command = ["umi-random-husbu", "umi-husbu", "umi-husbando", "husbu", "husbando"]
handler.tags = ["random"]
handler.description = "Random gambar husbu/husbando anime"
handler.importSource = "umi"
handler.importConfig = {"name": "husbu", "alias": ["husbando"], "category": "random", "description": "Random gambar husbu/husbando anime", "usage": ".husbu", "example": ".husbu", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-random-husbu": "husbu", "umi-husbu": "husbu", "umi-husbando": "husbando", "husbu": "husbu", "husbando": "husbando"}
export default handler
