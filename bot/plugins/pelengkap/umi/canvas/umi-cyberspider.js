import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cyberspider", "category": "canvas", "aliasMap": {"umi-canvas-cyberspider": "cyberspider", "umi-cyberspider": "cyberspider", "cyberspider": "cyberspider"}, "description": "Bikin card cyber spider dari fotomu", "usage": ".cyberspider <teks> (reply/kirim foto)", "example": ".cyberspider Cyber", "cooldown": 5, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/cyberspider.js", metadata, m, extra)
handler.help = ["umi-canvas-cyberspider <teks> (reply/kirim foto)"]
handler.command = ["umi-canvas-cyberspider", "umi-cyberspider", "cyberspider"]
handler.tags = ["canvas"]
handler.description = "Bikin card cyber spider dari fotomu"
handler.importSource = "umi"
handler.importConfig = {"name": "cyberspider", "alias": [], "category": "canvas", "description": "Bikin card cyber spider dari fotomu", "usage": ".cyberspider <teks> (reply/kirim foto)", "example": ".cyberspider Cyber", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-cyberspider": "cyberspider", "umi-cyberspider": "cyberspider", "cyberspider": "cyberspider"}
export default handler
