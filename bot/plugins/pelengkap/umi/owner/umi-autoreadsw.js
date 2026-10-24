/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "autoreadsw", "category": "owner", "aliasMap": {"umi-owner-autoreadsw": "autoreadsw", "umi-autoreadsw": "autoreadsw", "umi-autoreadstory": "autoreadstory", "umi-readstory": "readstory", "umi-bacasw": "bacasw", "autoreadsw": "autoreadsw", "autoreadstory": "autoreadstory", "readstory": "readstory", "bacasw": "bacasw"}, "description": "Auto read semua status/story WA", "usage": ".autoreadsw on/off", "example": ".autoreadsw on", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/autoreadsw.js", metadata, m, extra)
handler.help = ["umi-owner-autoreadsw on/off"]
handler.command = ["umi-owner-autoreadsw", "umi-autoreadsw", "umi-autoreadstory", "umi-readstory", "umi-bacasw", "autoreadsw", "autoreadstory", "readstory", "bacasw"]
handler.tags = ["owner"]
handler.description = "Auto read semua status/story WA"
handler.importSource = "umi"
handler.importConfig = {"name": "autoreadsw", "alias": ["autoreadstory", "readstory", "bacasw"], "category": "owner", "description": "Auto read semua status/story WA", "usage": ".autoreadsw on/off", "example": ".autoreadsw on", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-autoreadsw": "autoreadsw", "umi-autoreadsw": "autoreadsw", "umi-autoreadstory": "autoreadstory", "umi-readstory": "readstory", "umi-bacasw": "bacasw", "autoreadsw": "autoreadsw", "autoreadstory": "autoreadstory", "readstory": "readstory", "bacasw": "bacasw"}
export default handler
