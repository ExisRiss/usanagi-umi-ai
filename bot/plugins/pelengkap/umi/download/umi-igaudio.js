/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "igaudio", "category": "download", "aliasMap": {"umi-download-igaudio": "igaudio", "umi-igaudio": "igaudio", "umi-igmp3": "igmp3"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/download/igaudio.js", metadata, m, extra)
handler.help = ["umi-download-igaudio"]
handler.command = ["umi-download-igaudio", "umi-igaudio", "umi-igmp3"]
handler.tags = ["download"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "igaudio", "alias": ["igmp3"], "category": "download", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-download-igaudio": "igaudio", "umi-igaudio": "igaudio", "umi-igmp3": "igmp3"}
export default handler
