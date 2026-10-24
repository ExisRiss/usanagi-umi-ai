/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "fetchweb", "category": "tools", "aliasMap": {"umi-tools-fetchweb": "fetchweb", "umi-fetchweb": "fetchweb", "umi-webget": "webget", "umi-getweb": "getweb", "umi-ambilweb": "ambilweb", "umi-downloadweb": "downloadweb", "fetchweb": "fetchweb", "webget": "webget", "getweb": "getweb", "ambilweb": "ambilweb", "downloadweb": "downloadweb"}, "description": "Fetch dan simpan halaman web", "usage": ".fetchweb <url>", "example": ".fetchweb https://ditzzx.my.id", "cooldown": 30, "energi": 5}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/fetchweb.js", metadata, m, extra)
handler.help = ["umi-tools-fetchweb <url>"]
handler.command = ["umi-tools-fetchweb", "umi-fetchweb", "umi-webget", "umi-getweb", "umi-ambilweb", "umi-downloadweb", "fetchweb", "webget", "getweb", "ambilweb", "downloadweb"]
handler.tags = ["tools"]
handler.description = "Fetch dan simpan halaman web"
handler.importSource = "umi"
handler.importConfig = {"name": "fetchweb", "alias": ["webget", "getweb", "ambilweb", "downloadweb"], "category": "tools", "description": "Fetch dan simpan halaman web", "usage": ".fetchweb <url>", "example": ".fetchweb https://ditzzx.my.id", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 30, "energi": 5, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-tools-fetchweb": "fetchweb", "umi-fetchweb": "fetchweb", "umi-webget": "webget", "umi-getweb": "getweb", "umi-ambilweb": "ambilweb", "umi-downloadweb": "downloadweb", "fetchweb": "fetchweb", "webget": "webget", "getweb": "getweb", "ambilweb": "ambilweb", "downloadweb": "downloadweb"}
export default handler
