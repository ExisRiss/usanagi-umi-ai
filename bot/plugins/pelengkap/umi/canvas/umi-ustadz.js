/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "ustadz", "category": "canvas", "aliasMap": {"umi-canvas-ustadz": "ustadz", "umi-ustadz": "ustadz", "umi-ustad": "ustad", "umi-quoteustadz": "quoteustadz", "umi-canvasustadz": "canvasustadz", "ustadz": "ustadz", "ustad": "ustad", "quoteustadz": "quoteustadz", "canvasustadz": "canvasustadz"}, "description": "Buat quote gaya ustadz", "usage": ".ustadz <text>", "example": ".ustadz Jangan lupa sholat", "cooldown": 10, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/ustadz.js", metadata, m, extra)
handler.help = ["umi-canvas-ustadz <text>"]
handler.command = ["umi-canvas-ustadz", "umi-ustadz", "umi-ustad", "umi-quoteustadz", "umi-canvasustadz", "ustadz", "ustad", "quoteustadz", "canvasustadz"]
handler.tags = ["canvas"]
handler.description = "Buat quote gaya ustadz"
handler.importSource = "umi"
handler.importConfig = {"name": "ustadz", "alias": ["ustad", "quoteustadz", "canvasustadz"], "category": "canvas", "description": "Buat quote gaya ustadz", "usage": ".ustadz <text>", "example": ".ustadz Jangan lupa sholat", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-ustadz": "ustadz", "umi-ustadz": "ustadz", "umi-ustad": "ustad", "umi-quoteustadz": "quoteustadz", "umi-canvasustadz": "canvasustadz", "ustadz": "ustadz", "ustad": "ustad", "quoteustadz": "quoteustadz", "canvasustadz": "canvasustadz"}
export default handler
