/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "fakekartupelajar", "category": "canvas", "aliasMap": {"umi-canvas-fakekartupelajar": "fakekartupelajar", "umi-fakekartupelajar": "fakekartupelajar", "umi-kartupelajarfake": "kartupelajarfake", "umi-fakestudentid": "fakestudentid", "umi-fakekps": "fakekps", "fakekartupelajar": "fakekartupelajar", "kartupelajarfake": "kartupelajarfake", "fakestudentid": "fakestudentid", "fakekps": "fakekps"}, "description": "Bikin fake kartu pelajar (buat konten/gaguan doang)", "usage": ".fakekartupelajar <nama> | <sekolah>", "example": ".fakekartupelajar Umi | SMA Negeri 02", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/fakekatubelajat.js", metadata, m, extra)
handler.help = ["umi-canvas-fakekartupelajar <nama> | <sekolah>"]
handler.command = ["umi-canvas-fakekartupelajar", "umi-fakekartupelajar", "umi-kartupelajarfake", "umi-fakestudentid", "umi-fakekps", "fakekartupelajar", "kartupelajarfake", "fakestudentid", "fakekps"]
handler.tags = ["canvas"]
handler.description = "Bikin fake kartu pelajar (buat konten/gaguan doang)"
handler.importSource = "umi"
handler.importConfig = {"name": "fakekartupelajar", "alias": ["kartupelajarfake", "fakestudentid", "fakekps"], "category": "canvas", "description": "Bikin fake kartu pelajar (buat konten/gaguan doang)", "usage": ".fakekartupelajar <nama> | <sekolah>", "example": ".fakekartupelajar Umi | SMA Negeri 02", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-fakekartupelajar": "fakekartupelajar", "umi-fakekartupelajar": "fakekartupelajar", "umi-kartupelajarfake": "kartupelajarfake", "umi-fakestudentid": "fakestudentid", "umi-fakekps": "fakekps", "fakekartupelajar": "fakekartupelajar", "kartupelajarfake": "kartupelajarfake", "fakestudentid": "fakestudentid", "fakekps": "fakekps"}
export default handler
