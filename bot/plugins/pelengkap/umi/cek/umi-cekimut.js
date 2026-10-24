/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cekimut", "category": "cek", "aliasMap": {"umi-cek-cekimut": "cekimut", "umi-cekimut": "cekimut", "umi-imut": "imut", "umi-cute": "cute", "cute": "cute"}, "description": "Cek seberapa imut kamu", "usage": ".cekimut <nama>", "example": ".cekimut Ani", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/cek/cekimut.js", metadata, m, extra)
handler.help = ["umi-cek-cekimut <nama>"]
handler.command = ["umi-cek-cekimut", "umi-cekimut", "umi-imut", "umi-cute", "cute"]
handler.tags = ["cek"]
handler.description = "Cek seberapa imut kamu"
handler.importSource = "umi"
handler.importConfig = {"name": "cekimut", "alias": ["imut", "cute"], "category": "cek", "description": "Cek seberapa imut kamu", "usage": ".cekimut <nama>", "example": ".cekimut Ani", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-cek-cekimut": "cekimut", "umi-cekimut": "cekimut", "umi-imut": "imut", "umi-cute": "cute", "cute": "cute"}
export default handler
