/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "tafsirmimpi", "category": "primbon", "aliasMap": {"umi-primbon-tafsirmimpi": "tafsirmimpi", "umi-tafsirmimpi": "tafsirmimpi", "umi-artimimpi": "artimimpi", "artimimpi": "artimimpi"}, "description": "Cari tafsir mimpi", "usage": ".tafsirmimpi <kata kunci>", "example": ".tafsirmimpi bertemu", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/primbon/tafsirmimpi.js", metadata, m, extra)
handler.help = ["umi-primbon-tafsirmimpi <kata kunci>"]
handler.command = ["umi-primbon-tafsirmimpi", "umi-tafsirmimpi", "umi-artimimpi", "artimimpi"]
handler.tags = ["primbon"]
handler.description = "Cari tafsir mimpi"
handler.importSource = "umi"
handler.importConfig = {"name": "tafsirmimpi", "alias": ["artimimpi", "mimpi"], "category": "primbon", "description": "Cari tafsir mimpi", "usage": ".tafsirmimpi <kata kunci>", "example": ".tafsirmimpi bertemu", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-primbon-tafsirmimpi": "tafsirmimpi", "umi-tafsirmimpi": "tafsirmimpi", "umi-artimimpi": "artimimpi", "artimimpi": "artimimpi"}
export default handler
