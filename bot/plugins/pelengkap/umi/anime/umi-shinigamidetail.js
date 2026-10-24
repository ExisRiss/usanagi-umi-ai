/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "shinigamidetail", "category": "anime", "aliasMap": {"umi-anime-shinigamidetail": "shinigamidetail", "umi-shinigamidetail": "shinigamidetail", "umi-shngm": "shngm", "umi-detailmanga": "detailmanga", "umi-komikshinigami": "komikshinigami", "shinigamidetail": "shinigamidetail", "shngm": "shngm", "detailmanga": "detailmanga", "komikshinigami": "komikshinigami", "shinigami": "shinigami"}, "description": "Melihat detail manga dan daftar 24 chapter terbaru dari Shinigami", "usage": ".shinigamidetail <url/manga_id>", "example": ".shinigamidetail https://g.shinigami.asia/series/fc727dec-d1f5-43e8-a77d-37382f636659", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/anime/shinigamidetail.js", metadata, m, extra)
handler.help = ["umi-anime-shinigamidetail <url/manga_id>"]
handler.command = ["umi-anime-shinigamidetail", "umi-shinigamidetail", "umi-shngm", "umi-detailmanga", "umi-komikshinigami", "shinigamidetail", "shngm", "detailmanga", "komikshinigami", "shinigami"]
handler.tags = ["anime"]
handler.description = "Melihat detail manga dan daftar 24 chapter terbaru dari Shinigami"
handler.importSource = "umi"
handler.importConfig = {"name": "shinigamidetail", "alias": ["shngm", "detailmanga", "komikshinigami", "shinigami"], "category": "anime", "description": "Melihat detail manga dan daftar 24 chapter terbaru dari Shinigami", "usage": ".shinigamidetail <url/manga_id>", "example": ".shinigamidetail https://g.shinigami.asia/series/fc727dec-d1f5-43e8-a77d-37382f636659", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-anime-shinigamidetail": "shinigamidetail", "umi-shinigamidetail": "shinigamidetail", "umi-shngm": "shngm", "umi-detailmanga": "detailmanga", "umi-komikshinigami": "komikshinigami", "shinigamidetail": "shinigamidetail", "shngm": "shngm", "detailmanga": "detailmanga", "komikshinigami": "komikshinigami", "shinigami": "shinigami"}
export default handler
