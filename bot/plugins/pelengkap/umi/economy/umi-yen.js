import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "yen", "category": "economy", "aliasMap": {"umi-economy-yen": "yen", "umi-yen": "yen", "umi-jpy": "jpy", "umi-kursyen": "kursyen", "umi-jepang": "jepang", "umi-konversiyen": "konversiyen", "yen": "yen", "jpy": "jpy", "kursyen": "kursyen", "jepang": "jepang", "konversiyen": "konversiyen"}, "description": "Konversi mata uang Rupiah ke Yen Jepang / sebaliknya", "usage": ".yen <nominal> <idr/jpy>", "example": ".yen 100000 idr\n.yen 5000 jpy", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/economy/yen.js", metadata, m, extra)
handler.help = ["umi-economy-yen <nominal> <idr/jpy>"]
handler.command = ["umi-economy-yen", "umi-yen", "umi-jpy", "umi-kursyen", "umi-jepang", "umi-konversiyen", "yen", "jpy", "kursyen", "jepang", "konversiyen"]
handler.tags = ["economy"]
handler.description = "Konversi mata uang Rupiah ke Yen Jepang / sebaliknya"
handler.importSource = "umi"
handler.importConfig = {"name": "yen", "alias": ["jpy", "kursyen", "jepang", "konversiyen"], "category": "economy", "description": "Konversi mata uang Rupiah ke Yen Jepang / sebaliknya", "usage": ".yen <nominal> <idr/jpy>", "example": ".yen 100000 idr\n.yen 5000 jpy", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-economy-yen": "yen", "umi-yen": "yen", "umi-jpy": "jpy", "umi-kursyen": "kursyen", "umi-jepang": "jepang", "umi-konversiyen": "konversiyen", "yen": "yen", "jpy": "jpy", "kursyen": "kursyen", "jepang": "jepang", "konversiyen": "konversiyen"}
export default handler
