import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "setaudio", "category": "media", "aliasMap": {"umi-media-setaudio": "setaudio", "umi-setaudio": "setaudio", "setaudio": "setaudio"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/media/setaudio.js", metadata, m, extra)
handler.help = ["umi-media-setaudio"]
handler.command = ["umi-media-setaudio", "umi-setaudio", "setaudio"]
handler.tags = ["media"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "setaudio", "alias": [], "category": "media", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-media-setaudio": "setaudio", "umi-setaudio": "setaudio", "setaudio": "setaudio"}
export default handler
