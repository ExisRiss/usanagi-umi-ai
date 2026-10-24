import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "getmp3", "category": "owner", "aliasMap": {"umi-owner-getmp3": "getmp3", "umi-getmp3": "getmp3", "umi-getaudio": "getaudio", "umi-ambilmp3": "ambilmp3", "umi-ambilaudio": "ambilaudio", "getmp3": "getmp3", "getaudio": "getaudio", "ambilmp3": "ambilmp3", "ambilaudio": "ambilaudio"}, "description": "Ambil file MP3/Audio dari folder assets/audio", "usage": ".getmp3 <nama_file.mp3>", "example": ".getmp3 zerotwo.mp3", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/getmp3.js", metadata, m, extra)
handler.help = ["umi-owner-getmp3 <nama_file.mp3>"]
handler.command = ["umi-owner-getmp3", "umi-getmp3", "umi-getaudio", "umi-ambilmp3", "umi-ambilaudio", "getmp3", "getaudio", "ambilmp3", "ambilaudio"]
handler.tags = ["owner"]
handler.description = "Ambil file MP3/Audio dari folder assets/audio"
handler.importSource = "umi"
handler.importConfig = {"name": "getmp3", "alias": ["getaudio", "ambilmp3", "ambilaudio"], "category": "owner", "description": "Ambil file MP3/Audio dari folder assets/audio", "usage": ".getmp3 <nama_file.mp3>", "example": ".getmp3 zerotwo.mp3", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-getmp3": "getmp3", "umi-getmp3": "getmp3", "umi-getaudio": "getaudio", "umi-ambilmp3": "ambilmp3", "umi-ambilaudio": "ambilaudio", "getmp3": "getmp3", "getaudio": "getaudio", "ambilmp3": "ambilmp3", "ambilaudio": "ambilaudio"}
export default handler
