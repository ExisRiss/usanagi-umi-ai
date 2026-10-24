/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "phisingataubukan", "category": "tools", "aliasMap": {"umi-tools-phisingataubukan": "phisingataubukan", "umi-phisingataubukan": "phisingataubukan", "umi-cekphising": "cekphising", "umi-checkphishing": "checkphishing", "umi-webphishing": "webphishing", "phisingataubukan": "phisingataubukan", "cekphising": "cekphising", "checkphishing": "checkphishing", "webphishing": "webphishing"}, "description": "Cek apakah sebuah link URL merupakan web phising/berbahaya atau aman.", "usage": ".phisingataubukan <url>", "example": ".phisingataubukan https://google.com", "cooldown": 10, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/phisingataubukan.js", metadata, m, extra)
handler.help = ["umi-tools-phisingataubukan <url>"]
handler.command = ["umi-tools-phisingataubukan", "umi-phisingataubukan", "umi-cekphising", "umi-checkphishing", "umi-webphishing", "phisingataubukan", "cekphising", "checkphishing", "webphishing"]
handler.tags = ["tools"]
handler.description = "Cek apakah sebuah link URL merupakan web phising/berbahaya atau aman."
handler.importSource = "umi"
handler.importConfig = {"name": "phisingataubukan", "alias": ["cekphising", "checkphishing", "webphishing"], "category": "tools", "description": "Cek apakah sebuah link URL merupakan web phising/berbahaya atau aman.", "usage": ".phisingataubukan <url>", "example": ".phisingataubukan https://google.com", "cooldown": 10, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-tools-phisingataubukan": "phisingataubukan", "umi-phisingataubukan": "phisingataubukan", "umi-cekphising": "cekphising", "umi-checkphishing": "checkphishing", "umi-webphishing": "webphishing", "phisingataubukan": "phisingataubukan", "cekphising": "cekphising", "checkphishing": "checkphishing", "webphishing": "webphishing"}
export default handler
