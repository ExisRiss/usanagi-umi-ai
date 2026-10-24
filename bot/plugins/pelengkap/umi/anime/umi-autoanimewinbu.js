/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "autoanimewinbu", "category": "anime", "aliasMap": {"umi-anime-autoanimewinbu": "autoanimewinbu", "umi-autoanimewinbu": "autoanimewinbu", "umi-aaw": "aaw", "umi-autoanime": "autoanime", "autoanimewinbu": "autoanimewinbu", "aaw": "aaw", "autoanime": "autoanime"}, "description": "Auto upload ongoing anime & donghua dari winbu.net (720p Pixeldrain)", "usage": ".autoanimewinbu <start|stop|status|cek|list|reset|addgrup|delgrup>", "example": ".autoanimewinbu start", "cooldown": 10, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/anime/autoanimewinbu.js", metadata, m, extra)
handler.help = ["umi-anime-autoanimewinbu <start|stop|status|cek|list|reset|addgrup|delgrup>"]
handler.command = ["umi-anime-autoanimewinbu", "umi-autoanimewinbu", "umi-aaw", "umi-autoanime", "autoanimewinbu", "aaw", "autoanime"]
handler.tags = ["anime"]
handler.description = "Auto upload ongoing anime & donghua dari winbu.net (720p Pixeldrain)"
handler.importSource = "umi"
handler.importConfig = {"name": "autoanimewinbu", "alias": ["aaw", "autoanime"], "category": "anime", "description": "Auto upload ongoing anime & donghua dari winbu.net (720p Pixeldrain)", "usage": ".autoanimewinbu <start|stop|status|cek|list|reset|addgrup|delgrup>", "example": ".autoanimewinbu start", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-anime-autoanimewinbu": "autoanimewinbu", "umi-autoanimewinbu": "autoanimewinbu", "umi-aaw": "aaw", "umi-autoanime": "autoanime", "autoanimewinbu": "autoanimewinbu", "aaw": "aaw", "autoanime": "autoanime"}
export default handler
