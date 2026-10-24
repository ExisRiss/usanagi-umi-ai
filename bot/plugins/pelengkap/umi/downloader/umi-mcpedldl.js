/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "mcpedldl", "category": "downloader", "aliasMap": {"umi-downloader-mcpedldl": "mcpedldl", "umi-mcpedldl": "mcpedldl", "umi-dlmcpedl": "dlmcpedl", "umi-mcpedldownload": "mcpedldownload", "umi-mcdl": "mcdl", "mcpedldl": "mcpedldl", "dlmcpedl": "dlmcpedl", "mcpedldownload": "mcpedldownload", "mcdl": "mcdl"}, "description": "Mengunduh file atau mengambil detail dari MCPEDL", "usage": ".mcpedldl <url/slug>", "example": ".mcpedldl lunac-shaders", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/downloader/mcpedldl.js", metadata, m, extra)
handler.help = ["umi-downloader-mcpedldl <url/slug>"]
handler.command = ["umi-downloader-mcpedldl", "umi-mcpedldl", "umi-dlmcpedl", "umi-mcpedldownload", "umi-mcdl", "mcpedldl", "dlmcpedl", "mcpedldownload", "mcdl"]
handler.tags = ["downloader"]
handler.description = "Mengunduh file atau mengambil detail dari MCPEDL"
handler.importSource = "umi"
handler.importConfig = {"name": "mcpedldl", "alias": ["dlmcpedl", "mcpedldownload", "mcdl"], "category": "downloader", "description": "Mengunduh file atau mengambil detail dari MCPEDL", "usage": ".mcpedldl <url/slug>", "example": ".mcpedldl lunac-shaders", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-downloader-mcpedldl": "mcpedldl", "umi-mcpedldl": "mcpedldl", "umi-dlmcpedl": "dlmcpedl", "umi-mcpedldownload": "mcpedldownload", "umi-mcdl": "mcdl", "mcpedldl": "mcpedldl", "dlmcpedl": "dlmcpedl", "mcpedldownload": "mcpedldownload", "mcdl": "mcdl"}
export default handler
