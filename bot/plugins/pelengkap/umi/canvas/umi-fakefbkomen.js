import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "fakefbkomen", "category": "canvas", "aliasMap": {"umi-canvas-fakefbkomen": "fakefbkomen", "umi-fakefbkomen": "fakefbkomen", "umi-fbkomen": "fbkomen", "umi-komenfb": "komenfb", "fakefbkomen": "fakefbkomen", "fbkomen": "fbkomen", "komenfb": "komenfb"}, "description": "Bikin gambar komentar palsu facebook", "usage": ".fakefbkomen <nama>|<komentar> (reply/kirim foto)", "example": ".fakefbkomen Fauzan|Ini komentar saya", "cooldown": 5, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/fakefbkomen.js", metadata, m, extra)
handler.help = ["umi-canvas-fakefbkomen <nama>|<komentar> (reply/kirim foto)"]
handler.command = ["umi-canvas-fakefbkomen", "umi-fakefbkomen", "umi-fbkomen", "umi-komenfb", "fakefbkomen", "fbkomen", "komenfb"]
handler.tags = ["canvas"]
handler.description = "Bikin gambar komentar palsu facebook"
handler.importSource = "umi"
handler.importConfig = {"name": "fakefbkomen", "alias": ["fbkomen", "komenfb"], "category": "canvas", "description": "Bikin gambar komentar palsu facebook", "usage": ".fakefbkomen <nama>|<komentar> (reply/kirim foto)", "example": ".fakefbkomen Fauzan|Ini komentar saya", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-fakefbkomen": "fakefbkomen", "umi-fakefbkomen": "fakefbkomen", "umi-fbkomen": "fbkomen", "umi-komenfb": "komenfb", "fakefbkomen": "fakefbkomen", "fbkomen": "fbkomen", "komenfb": "komenfb"}
export default handler
