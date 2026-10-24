/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "ttimg", "category": "download", "aliasMap": {"umi-download-ttimg": "ttimg", "umi-ttimg": "ttimg", "umi-tiktokimg": "tiktokimg", "ttimg": "ttimg", "tiktokimg": "tiktokimg"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/download/ttimg.js", metadata, m, extra)
handler.help = ["umi-download-ttimg"]
handler.command = ["umi-download-ttimg", "umi-ttimg", "umi-tiktokimg", "ttimg", "tiktokimg"]
handler.tags = ["download"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "ttimg", "alias": ["tiktokimg"], "category": "download", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-download-ttimg": "ttimg", "umi-ttimg": "ttimg", "umi-tiktokimg": "tiktokimg", "ttimg": "ttimg", "tiktokimg": "tiktokimg"}
export default handler
