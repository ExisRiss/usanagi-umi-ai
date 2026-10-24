/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "sistemdaftar", "category": "owner", "aliasMap": {"umi-owner-sistemdaftar": "sistemdaftar", "umi-sistemdaftar": "sistemdaftar", "umi-regmode": "regmode", "umi-wajibdaftar": "wajibdaftar", "umi-togglereg": "togglereg", "sistemdaftar": "sistemdaftar", "regmode": "regmode", "wajibdaftar": "wajibdaftar", "togglereg": "togglereg"}, "description": "Kelola sistem wajib daftar dan statistik pendaftaran", "usage": ".sistemdaftar <on/off/stats>", "example": ".sistemdaftar stats", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/sistemdaftar.js", metadata, m, extra)
handler.help = ["umi-owner-sistemdaftar <on/off/stats>"]
handler.command = ["umi-owner-sistemdaftar", "umi-sistemdaftar", "umi-regmode", "umi-wajibdaftar", "umi-togglereg", "sistemdaftar", "regmode", "wajibdaftar", "togglereg"]
handler.tags = ["owner"]
handler.description = "Kelola sistem wajib daftar dan statistik pendaftaran"
handler.importSource = "umi"
handler.importConfig = {"name": "sistemdaftar", "alias": ["regmode", "wajibdaftar", "togglereg"], "category": "owner", "description": "Kelola sistem wajib daftar dan statistik pendaftaran", "usage": ".sistemdaftar <on/off/stats>", "example": ".sistemdaftar stats", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-sistemdaftar": "sistemdaftar", "umi-sistemdaftar": "sistemdaftar", "umi-regmode": "regmode", "umi-wajibdaftar": "wajibdaftar", "umi-togglereg": "togglereg", "sistemdaftar": "sistemdaftar", "regmode": "regmode", "wajibdaftar": "wajibdaftar", "togglereg": "togglereg"}
export default handler
