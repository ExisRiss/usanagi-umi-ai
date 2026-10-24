import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "streamer", "category": "rpg", "aliasMap": {"umi-rpg-streamer": "streamer", "umi-streamer": "streamer", "umi-live": "live", "umi-vtuber": "vtuber"}, "description": "Live streaming game dapet donasi besar tapi resiko dibanned platform!", "usage": ".streamer", "example": ".streamer", "cooldown": 180, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/streamer.js", metadata, m, extra)
handler.help = ["umi-rpg-streamer"]
handler.command = ["umi-rpg-streamer", "umi-streamer", "umi-live", "umi-vtuber"]
handler.tags = ["rpg"]
handler.description = "Live streaming game dapet donasi besar tapi resiko dibanned platform!"
handler.importSource = "umi"
handler.importConfig = {"name": "streamer", "alias": ["live", "vtuber"], "category": "rpg", "description": "Live streaming game dapet donasi besar tapi resiko dibanned platform!", "usage": ".streamer", "example": ".streamer", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 180, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-rpg-streamer": "streamer", "umi-streamer": "streamer", "umi-live": "live", "umi-vtuber": "vtuber"}
export default handler
