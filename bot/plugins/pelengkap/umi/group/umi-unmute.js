import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "unmute", "category": "group", "aliasMap": {"umi-group-unmute": "unmute", "umi-unmute": "unmute", "umi-unbisukan": "unbisukan", "unmute": "unmute", "unbisukan": "unbisukan"}, "description": "Membuka mute grup", "usage": ".unmute", "example": ".unmute", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/unmute.js", metadata, m, extra)
handler.help = ["umi-group-unmute"]
handler.command = ["umi-group-unmute", "umi-unmute", "umi-unbisukan", "unmute", "unbisukan"]
handler.tags = ["group"]
handler.description = "Membuka mute grup"
handler.importSource = "umi"
handler.importConfig = {"name": "unmute", "alias": ["unbisukan"], "category": "group", "description": "Membuka mute grup", "usage": ".unmute", "example": ".unmute", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "isAdmin": true, "isBotAdmin": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = true
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-unmute": "unmute", "umi-unmute": "unmute", "umi-unbisukan": "unbisukan", "unmute": "unmute", "unbisukan": "unbisukan"}
export default handler
