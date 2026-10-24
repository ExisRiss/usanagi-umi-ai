/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "ambilfile", "category": "owner", "aliasMap": {"umi-owner-ambilfile": "ambilfile", "umi-ambilfile": "ambilfile", "umi-getfile": "getfile", "umi-downloadfile": "downloadfile", "ambilfile": "ambilfile", "getfile": "getfile", "downloadfile": "downloadfile"}, "description": "Ambil file dari project bot tanpa perlu .js", "usage": ".ambilfile <nama file>", "example": ".ambilfile config", "cooldown": 5}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/ambilfile.js", metadata, m, extra)
handler.help = ["umi-owner-ambilfile <nama file>"]
handler.command = ["umi-owner-ambilfile", "umi-ambilfile", "umi-getfile", "umi-downloadfile", "ambilfile", "getfile", "downloadfile"]
handler.tags = ["owner"]
handler.description = "Ambil file dari project bot tanpa perlu .js"
handler.importSource = "umi"
handler.importConfig = {"name": "ambilfile", "alias": ["getfile", "downloadfile"], "category": "owner", "description": "Ambil file dari project bot tanpa perlu .js", "usage": ".ambilfile <nama file>", "example": ".ambilfile config", "isOwner": true, "cooldown": 5, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-ambilfile": "ambilfile", "umi-ambilfile": "ambilfile", "umi-getfile": "getfile", "umi-downloadfile": "downloadfile", "ambilfile": "ambilfile", "getfile": "getfile", "downloadfile": "downloadfile"}
export default handler
