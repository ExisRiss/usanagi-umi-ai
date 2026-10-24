/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "spotify", "category": "search", "aliasMap": {"umi-search-spotify": "spotify", "umi-spotify": "spotify", "umi-spotifysearch": "spotifysearch", "umi-spsearch": "spsearch", "spsearch": "spsearch"}, "description": "Mencari daftar lagu di Spotify berdasarkan judul atau artis", "usage": ".spotify <query>", "example": ".spotify neffex grateful", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/search/spotify.js", metadata, m, extra)
handler.help = ["umi-search-spotify <query>"]
handler.command = ["umi-search-spotify", "umi-spotify", "umi-spotifysearch", "umi-spsearch", "spsearch"]
handler.tags = ["search"]
handler.description = "Mencari daftar lagu di Spotify berdasarkan judul atau artis"
handler.importSource = "umi"
handler.importConfig = {"name": "spotify", "alias": ["spotifysearch", "spsearch"], "category": "search", "description": "Mencari daftar lagu di Spotify berdasarkan judul atau artis", "usage": ".spotify <query>", "example": ".spotify neffex grateful", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-search-spotify": "spotify", "umi-spotify": "spotify", "umi-spotifysearch": "spotifysearch", "umi-spsearch": "spsearch", "spsearch": "spsearch"}
export default handler
