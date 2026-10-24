import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "darkangel", "category": "canvas", "aliasMap": {"umi-canvas-darkangel": "darkangel", "umi-darkangel": "darkangel", "darkangel": "darkangel"}, "description": "Bikin card dark angel dari fotomu", "usage": ".darkangel <teks> (reply/kirim foto)", "example": ".darkangel Dark", "cooldown": 5, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/darkangel.js", metadata, m, extra)
handler.help = ["umi-canvas-darkangel <teks> (reply/kirim foto)"]
handler.command = ["umi-canvas-darkangel", "umi-darkangel", "darkangel"]
handler.tags = ["canvas"]
handler.description = "Bikin card dark angel dari fotomu"
handler.importSource = "umi"
handler.importConfig = {"name": "darkangel", "alias": [], "category": "canvas", "description": "Bikin card dark angel dari fotomu", "usage": ".darkangel <teks> (reply/kirim foto)", "example": ".darkangel Dark", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-darkangel": "darkangel", "umi-darkangel": "darkangel", "darkangel": "darkangel"}
export default handler
