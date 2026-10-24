/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "alightmotiondl", "category": "downloader", "aliasMap": {"umi-downloader-alightmotiondl": "alightmotiondl", "umi-alightmotiondl": "alightmotiondl", "umi-alightmotion": "alightmotion", "umi-amdl": "amdl", "alightmotiondl": "alightmotiondl", "alightmotion": "alightmotion", "amdl": "amdl"}, "description": "Download project/preset Alight Motion", "usage": ".amdl <link>", "example": ".amdl https://alight.link/...", "cooldown": 10, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/download/alightmotion.js", metadata, m, extra)
handler.help = ["umi-downloader-alightmotiondl <link>"]
handler.command = ["umi-downloader-alightmotiondl", "umi-alightmotiondl", "umi-alightmotion", "umi-amdl", "alightmotiondl", "alightmotion", "amdl"]
handler.tags = ["downloader"]
handler.description = "Download project/preset Alight Motion"
handler.importSource = "umi"
handler.importConfig = {"name": "alightmotiondl", "alias": ["alightmotion", "amdl"], "category": "downloader", "description": "Download project/preset Alight Motion", "usage": ".amdl <link>", "example": ".amdl https://alight.link/...", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-downloader-alightmotiondl": "alightmotiondl", "umi-alightmotiondl": "alightmotiondl", "umi-alightmotion": "alightmotion", "umi-amdl": "amdl", "alightmotiondl": "alightmotiondl", "alightmotion": "alightmotion", "amdl": "amdl"}
export default handler
