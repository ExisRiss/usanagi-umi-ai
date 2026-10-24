import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "angelnick", "category": "canvas", "aliasMap": {"umi-canvas-angelnick": "angelnick", "umi-angelnick": "angelnick", "angelnick": "angelnick"}, "description": "Bikin card angel nick dari fotomu", "usage": ".angelnick <teks> (reply/kirim foto)", "example": ".angelnick Fauzan", "cooldown": 5, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/angelnick.js", metadata, m, extra)
handler.help = ["umi-canvas-angelnick <teks> (reply/kirim foto)"]
handler.command = ["umi-canvas-angelnick", "umi-angelnick", "angelnick"]
handler.tags = ["canvas"]
handler.description = "Bikin card angel nick dari fotomu"
handler.importSource = "umi"
handler.importConfig = {"name": "angelnick", "alias": [], "category": "canvas", "description": "Bikin card angel nick dari fotomu", "usage": ".angelnick <teks> (reply/kirim foto)", "example": ".angelnick Fauzan", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-angelnick": "angelnick", "umi-angelnick": "angelnick", "angelnick": "angelnick"}
export default handler
