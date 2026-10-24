/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "profileff", "category": "canvas", "aliasMap": {"umi-canvas-profileff": "profileff", "umi-profileff": "profileff", "umi-profilff": "profilff", "umi-pff": "pff", "profileff": "profileff", "profilff": "profilff", "pff": "pff"}, "description": "Buat gambar profil FF keren", "usage": ".profileff <nama> | <guild> | <bg_index>", "example": ".profileff Fauzan | Umi | 1", "cooldown": 5, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/profileff.js", metadata, m, extra)
handler.help = ["umi-canvas-profileff <nama> | <guild> | <bg_index>"]
handler.command = ["umi-canvas-profileff", "umi-profileff", "umi-profilff", "umi-pff", "profileff", "profilff", "pff"]
handler.tags = ["canvas"]
handler.description = "Buat gambar profil FF keren"
handler.importSource = "umi"
handler.importConfig = {"name": "profileff", "alias": ["profilff", "pff"], "category": "canvas", "description": "Buat gambar profil FF keren", "usage": ".profileff <nama> | <guild> | <bg_index>", "example": ".profileff Fauzan | Umi | 1", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-profileff": "profileff", "umi-profileff": "profileff", "umi-profilff": "profilff", "umi-pff": "pff", "profileff": "profileff", "profilff": "profilff", "pff": "pff"}
export default handler
