/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "sholawat", "category": "religi", "aliasMap": {"umi-religi-sholawat": "sholawat", "umi-sholawat": "sholawat", "umi-shalawat": "shalawat", "umi-selawat": "selawat", "umi-sholawatnabi": "sholawatnabi", "sholawat": "sholawat", "shalawat": "shalawat", "selawat": "selawat", "sholawatnabi": "sholawatnabi"}, "description": "Kumpulan Sholawat Nabi lengkap dengan Arab, Latin, Arti, dan Keutamaan", "usage": ".sholawat <nama sholawat>", "example": ".sholawat nariyah", "cooldown": 3}
const handler = (m, extra) => runImportedFeature("umi", "plugins/islamic/sholawat.js", metadata, m, extra)
handler.help = ["umi-religi-sholawat <nama sholawat>"]
handler.command = ["umi-religi-sholawat", "umi-sholawat", "umi-shalawat", "umi-selawat", "umi-sholawatnabi", "sholawat", "shalawat", "selawat", "sholawatnabi"]
handler.tags = ["religi"]
handler.description = "Kumpulan Sholawat Nabi lengkap dengan Arab, Latin, Arti, dan Keutamaan"
handler.importSource = "umi"
handler.importConfig = {"name": "sholawat", "alias": ["shalawat", "selawat", "sholawatnabi"], "category": "religi", "description": "Kumpulan Sholawat Nabi lengkap dengan Arab, Latin, Arti, dan Keutamaan", "usage": ".sholawat <nama sholawat>", "example": ".sholawat nariyah", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-religi-sholawat": "sholawat", "umi-sholawat": "sholawat", "umi-shalawat": "shalawat", "umi-selawat": "selawat", "umi-sholawatnabi": "sholawatnabi", "sholawat": "sholawat", "shalawat": "shalawat", "selawat": "selawat", "sholawatnabi": "sholawatnabi"}
export default handler
