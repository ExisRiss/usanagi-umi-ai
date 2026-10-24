/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "afinitasml2", "category": "canvas", "aliasMap": {"umi-canvas-afinitasml2": "afinitasml2", "umi-afinitasml2": "afinitasml2", "afinitasml2": "afinitasml2"}, "description": "Bikin card afinitas ML (versi 2) dari fotomu", "usage": ".afinitasml2 (reply/kirim foto)", "example": ".afinitasml2", "cooldown": 5, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/afinitasml2.js", metadata, m, extra)
handler.help = ["umi-canvas-afinitasml2 (reply/kirim foto)"]
handler.command = ["umi-canvas-afinitasml2", "umi-afinitasml2", "afinitasml2"]
handler.tags = ["canvas"]
handler.description = "Bikin card afinitas ML (versi 2) dari fotomu"
handler.importSource = "umi"
handler.importConfig = {"name": "afinitasml2", "alias": [], "category": "canvas", "description": "Bikin card afinitas ML (versi 2) dari fotomu", "usage": ".afinitasml2 (reply/kirim foto)", "example": ".afinitasml2", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-afinitasml2": "afinitasml2", "umi-afinitasml2": "afinitasml2", "afinitasml2": "afinitasml2"}
export default handler
