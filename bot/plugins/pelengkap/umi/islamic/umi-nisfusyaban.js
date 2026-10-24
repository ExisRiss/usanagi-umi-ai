/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "nisfusyaban", "category": "religi", "aliasMap": {"umi-religi-nisfusyaban": "nisfusyaban", "umi-nisfusyaban": "nisfusyaban", "umi-nisfu": "nisfu", "umi-malamnisfu": "malamnisfu", "umi-syaban": "syaban", "nisfusyaban": "nisfusyaban", "nisfu": "nisfu", "malamnisfu": "malamnisfu", "syaban": "syaban"}, "description": "Informasi lengkap tentang Malam Nisfu Syaban (doa, amalan, keutamaan)", "usage": ".nisfusyaban", "example": ".nisfusyaban", "cooldown": 3}
const handler = (m, extra) => runImportedFeature("umi", "plugins/islamic/nisfusyaban.js", metadata, m, extra)
handler.help = ["umi-religi-nisfusyaban"]
handler.command = ["umi-religi-nisfusyaban", "umi-nisfusyaban", "umi-nisfu", "umi-malamnisfu", "umi-syaban", "nisfusyaban", "nisfu", "malamnisfu", "syaban"]
handler.tags = ["religi"]
handler.description = "Informasi lengkap tentang Malam Nisfu Syaban (doa, amalan, keutamaan)"
handler.importSource = "umi"
handler.importConfig = {"name": "nisfusyaban", "alias": ["nisfu", "malamnisfu", "syaban"], "category": "religi", "description": "Informasi lengkap tentang Malam Nisfu Syaban (doa, amalan, keutamaan)", "usage": ".nisfusyaban", "example": ".nisfusyaban", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-religi-nisfusyaban": "nisfusyaban", "umi-nisfusyaban": "nisfusyaban", "umi-nisfu": "nisfu", "umi-malamnisfu": "malamnisfu", "umi-syaban": "syaban", "nisfusyaban": "nisfusyaban", "nisfu": "nisfu", "malamnisfu": "malamnisfu", "syaban": "syaban"}
export default handler
