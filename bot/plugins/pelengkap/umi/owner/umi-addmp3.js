import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "addmp3", "category": "owner", "aliasMap": {"umi-owner-addmp3": "addmp3", "umi-addmp3": "addmp3", "umi-addaudio": "addaudio", "umi-tambahmp3": "tambahmp3", "umi-setmp3": "setmp3", "umi-addmusik": "addmusik", "addmp3": "addmp3", "addaudio": "addaudio", "tambahmp3": "tambahmp3", "setmp3": "setmp3", "addmusik": "addmusik"}, "description": "Tambah file MP3/Audio ke folder assets/audio", "usage": ".addmp3 <nama_file.mp3> (reply audio)", "example": ".addmp3 zerotwo.mp3", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/addmp3.js", metadata, m, extra)
handler.help = ["umi-owner-addmp3 <nama_file.mp3> (reply audio)"]
handler.command = ["umi-owner-addmp3", "umi-addmp3", "umi-addaudio", "umi-tambahmp3", "umi-setmp3", "umi-addmusik", "addmp3", "addaudio", "tambahmp3", "setmp3", "addmusik"]
handler.tags = ["owner"]
handler.description = "Tambah file MP3/Audio ke folder assets/audio"
handler.importSource = "umi"
handler.importConfig = {"name": "addmp3", "alias": ["addaudio", "tambahmp3", "setmp3", "addmusik"], "category": "owner", "description": "Tambah file MP3/Audio ke folder assets/audio", "usage": ".addmp3 <nama_file.mp3> (reply audio)", "example": ".addmp3 zerotwo.mp3", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-addmp3": "addmp3", "umi-addmp3": "addmp3", "umi-addaudio": "addaudio", "umi-tambahmp3": "tambahmp3", "umi-setmp3": "setmp3", "umi-addmusik": "addmusik", "addmp3": "addmp3", "addaudio": "addaudio", "tambahmp3": "tambahmp3", "setmp3": "setmp3", "addmusik": "addmusik"}
export default handler
