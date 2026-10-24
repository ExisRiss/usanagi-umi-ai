/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "listdaftar", "category": "user", "aliasMap": {"umi-user-listdaftar": "listdaftar", "umi-listdaftar": "listdaftar", "umi-listuser": "listuser", "umi-registeredusers": "registeredusers", "umi-daftarlist": "daftarlist", "listdaftar": "listdaftar", "listuser": "listuser", "registeredusers": "registeredusers", "daftarlist": "daftarlist"}, "description": "Lihat daftar user yang sudah terdaftar dengan filter dan pagination", "usage": ".listdaftar [page <nomor>] [search <nama>] [sort terbaru]", "example": ".listdaftar search zann sort terbaru page 2", "cooldown": 10, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/user/listdaftar.js", metadata, m, extra)
handler.help = ["umi-user-listdaftar [page <nomor>] [search <nama>] [sort terbaru]"]
handler.command = ["umi-user-listdaftar", "umi-listdaftar", "umi-listuser", "umi-registeredusers", "umi-daftarlist", "listdaftar", "listuser", "registeredusers", "daftarlist"]
handler.tags = ["user"]
handler.description = "Lihat daftar user yang sudah terdaftar dengan filter dan pagination"
handler.importSource = "umi"
handler.importConfig = {"name": "listdaftar", "alias": ["listuser", "registeredusers", "daftarlist"], "category": "user", "description": "Lihat daftar user yang sudah terdaftar dengan filter dan pagination", "usage": ".listdaftar [page <nomor>] [search <nama>] [sort terbaru]", "example": ".listdaftar search zann sort terbaru page 2", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-user-listdaftar": "listdaftar", "umi-listdaftar": "listdaftar", "umi-listuser": "listuser", "umi-registeredusers": "registeredusers", "umi-daftarlist": "daftarlist", "listdaftar": "listdaftar", "listuser": "listuser", "registeredusers": "registeredusers", "daftarlist": "daftarlist"}
export default handler
