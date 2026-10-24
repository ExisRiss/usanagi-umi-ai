import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "addpartner", "category": "owner", "aliasMap": {"umi-owner-addpartner": "addpartner", "umi-addpartner": "addpartner", "umi-delpartner": "delpartner", "umi-listpartner": "listpartner", "addpartner": "addpartner", "delpartner": "delpartner", "listpartner": "listpartner"}, "description": "Kelola daftar partner bot", "usage": ".addpartner <nomor/@tag> [hari]\n.delpartner <nomor/@tag>\n.listpartner\n.cekpartner <nomor/@tag>", "example": ".addpartner 6281234567890 30", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/addpartner.js", metadata, m, extra)
handler.help = ["umi-owner-addpartner <nomor/@tag> [hari]\n.delpartner <nomor/@tag>\n.listpartner\n.cekpartner <nomor/@tag>"]
handler.command = ["umi-owner-addpartner", "umi-addpartner", "umi-delpartner", "umi-listpartner", "addpartner", "delpartner", "listpartner"]
handler.tags = ["owner"]
handler.description = "Kelola daftar partner bot"
handler.importSource = "umi"
handler.importConfig = {"name": "addpartner", "alias": ["delpartner", "listpartner"], "category": "owner", "description": "Kelola daftar partner bot", "usage": ".addpartner <nomor/@tag> [hari]\n.delpartner <nomor/@tag>\n.listpartner\n.cekpartner <nomor/@tag>", "example": ".addpartner 6281234567890 30", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-addpartner": "addpartner", "umi-addpartner": "addpartner", "umi-delpartner": "delpartner", "umi-listpartner": "listpartner", "addpartner": "addpartner", "delpartner": "delpartner", "listpartner": "listpartner"}
export default handler
