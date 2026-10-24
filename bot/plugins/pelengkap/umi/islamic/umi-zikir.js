import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "zikir", "category": "religi", "aliasMap": {"umi-religi-zikir": "zikir", "umi-zikir": "zikir", "umi-dzikir": "dzikir", "umi-wirid": "wirid", "umi-zikirpagi": "zikirpagi", "umi-zikirpetang": "zikirpetang", "zikir": "zikir", "dzikir": "dzikir", "wirid": "wirid", "zikirpagi": "zikirpagi", "zikirpetang": "zikirpetang"}, "description": "Kumpulan Zikir Harian (Pagi, Petang, Setelah Sholat, dan Lainnya)", "usage": ".zikir <pagi/petang/sholat>", "example": ".zikir pagi", "cooldown": 3}
const handler = (m, extra) => runImportedFeature("umi", "plugins/islamic/zikir.js", metadata, m, extra)
handler.help = ["umi-religi-zikir <pagi/petang/sholat>"]
handler.command = ["umi-religi-zikir", "umi-zikir", "umi-dzikir", "umi-wirid", "umi-zikirpagi", "umi-zikirpetang", "zikir", "dzikir", "wirid", "zikirpagi", "zikirpetang"]
handler.tags = ["religi"]
handler.description = "Kumpulan Zikir Harian (Pagi, Petang, Setelah Sholat, dan Lainnya)"
handler.importSource = "umi"
handler.importConfig = {"name": "zikir", "alias": ["dzikir", "wirid", "zikirpagi", "zikirpetang"], "category": "religi", "description": "Kumpulan Zikir Harian (Pagi, Petang, Setelah Sholat, dan Lainnya)", "usage": ".zikir <pagi/petang/sholat>", "example": ".zikir pagi", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-religi-zikir": "zikir", "umi-zikir": "zikir", "umi-dzikir": "dzikir", "umi-wirid": "wirid", "umi-zikirpagi": "zikirpagi", "umi-zikirpetang": "zikirpetang", "zikir": "zikir", "dzikir": "dzikir", "wirid": "wirid", "zikirpagi": "zikirpagi", "zikirpetang": "zikirpetang"}
export default handler
