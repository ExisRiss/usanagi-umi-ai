/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cekpintar", "category": "cek", "aliasMap": {"umi-cek-cekpintar": "cekpintar", "umi-cekpintar": "cekpintar", "umi-pintar": "pintar", "umi-iq": "iq", "umi-smart": "smart", "smart": "smart"}, "description": "Cek seberapa pintar kamu", "usage": ".cekpintar <nama>", "example": ".cekpintar Budi", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/cek/cekpintar.js", metadata, m, extra)
handler.help = ["umi-cek-cekpintar <nama>"]
handler.command = ["umi-cek-cekpintar", "umi-cekpintar", "umi-pintar", "umi-iq", "umi-smart", "smart"]
handler.tags = ["cek"]
handler.description = "Cek seberapa pintar kamu"
handler.importSource = "umi"
handler.importConfig = {"name": "cekpintar", "alias": ["pintar", "iq", "smart"], "category": "cek", "description": "Cek seberapa pintar kamu", "usage": ".cekpintar <nama>", "example": ".cekpintar Budi", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-cek-cekpintar": "cekpintar", "umi-cekpintar": "cekpintar", "umi-pintar": "pintar", "umi-iq": "iq", "umi-smart": "smart", "smart": "smart"}
export default handler
