/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cekyandere", "category": "cek", "aliasMap": {"umi-cek-cekyandere": "cekyandere", "umi-cekyandere": "cekyandere", "umi-yandere": "yandere"}, "description": "Cek tingkat yandere kamu", "usage": ".cekyandere <nama>", "example": ".cekyandere Budi", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/cek/cekyandere.js", metadata, m, extra)
handler.help = ["umi-cek-cekyandere <nama>"]
handler.command = ["umi-cek-cekyandere", "umi-cekyandere", "umi-yandere"]
handler.tags = ["cek"]
handler.description = "Cek tingkat yandere kamu"
handler.importSource = "umi"
handler.importConfig = {"name": "cekyandere", "alias": ["yandere"], "category": "cek", "description": "Cek tingkat yandere kamu", "usage": ".cekyandere <nama>", "example": ".cekyandere Budi", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-cek-cekyandere": "cekyandere", "umi-cekyandere": "cekyandere", "umi-yandere": "yandere"}
export default handler
