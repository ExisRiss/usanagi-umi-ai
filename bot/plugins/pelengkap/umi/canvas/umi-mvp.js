/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "mvp", "category": "canvas", "aliasMap": {"umi-canvas-mvp": "mvp", "umi-mvp": "mvp", "umi-sertifikatmvp": "sertifikatmvp", "mvp": "mvp", "sertifikatmvp": "sertifikatmvp"}, "description": "Buat sertifikat MVP", "usage": ".mvp <nama>", "example": ".mvp Fauzan", "cooldown": 5, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/mvp.js", metadata, m, extra)
handler.help = ["umi-canvas-mvp <nama>"]
handler.command = ["umi-canvas-mvp", "umi-mvp", "umi-sertifikatmvp", "mvp", "sertifikatmvp"]
handler.tags = ["canvas"]
handler.description = "Buat sertifikat MVP"
handler.importSource = "umi"
handler.importConfig = {"name": "mvp", "alias": ["sertifikatmvp", "mvp"], "category": "canvas", "description": "Buat sertifikat MVP", "usage": ".mvp <nama>", "example": ".mvp Fauzan", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-mvp": "mvp", "umi-mvp": "mvp", "umi-sertifikatmvp": "sertifikatmvp", "mvp": "mvp", "sertifikatmvp": "sertifikatmvp"}
export default handler
