/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "music", "category": "media", "aliasMap": {"umi-media-music": "music", "umi-music": "music", "music": "music"}, "description": "Koleksi musik 1-65", "usage": ".music1 sampai .music65", "example": ".music1", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/media/music.js", metadata, m, extra)
handler.help = ["umi-media-music sampai .music65"]
handler.command = ["umi-media-music", "umi-music", "music"]
handler.tags = ["media"]
handler.description = "Koleksi musik 1-65"
handler.importSource = "umi"
handler.importConfig = {"name": "music", "category": "media", "description": "Koleksi musik 1-65", "usage": ".music1 sampai .music65", "example": ".music1", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-media-music": "music", "umi-music": "music", "music": "music"}
export default handler
