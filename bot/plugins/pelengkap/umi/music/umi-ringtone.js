/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "ringtone", "category": "music", "aliasMap": {"umi-music-ringtone": "ringtone", "umi-ringtone": "ringtone", "ringtone": "ringtone"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/music/ringtone.js", metadata, m, extra)
handler.help = ["umi-music-ringtone"]
handler.command = ["umi-music-ringtone", "umi-ringtone", "ringtone"]
handler.tags = ["music"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "ringtone", "alias": [], "category": "music", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-music-ringtone": "ringtone", "umi-ringtone": "ringtone", "ringtone": "ringtone"}
export default handler
