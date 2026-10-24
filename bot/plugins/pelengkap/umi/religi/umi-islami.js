import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "islami", "category": "religi", "aliasMap": {"umi-religi-islami": "islami", "umi-islami": "islami", "umi-niatsholat": "niatsholat", "umi-niatshalat": "niatshalat", "umi-doa": "doa", "umi-berdoa": "berdoa", "umi-gislam": "gislam", "islami": "islami", "niatsholat": "niatsholat", "niatshalat": "niatshalat", "berdoa": "berdoa", "gislam": "gislam"}, "description": "Kumpulan fitur Islami (Asmaul Husna, Niat Sholat, Surah, Doa, Artikel, Kata Mutiara)", "usage": ".islami <fitur>", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/religi/islami.js", metadata, m, extra)
handler.help = ["umi-religi-islami <fitur>"]
handler.command = ["umi-religi-islami", "umi-islami", "umi-niatsholat", "umi-niatshalat", "umi-doa", "umi-berdoa", "umi-gislam", "islami", "niatsholat", "niatshalat", "berdoa", "gislam"]
handler.tags = ["religi"]
handler.description = "Kumpulan fitur Islami (Asmaul Husna, Niat Sholat, Surah, Doa, Artikel, Kata Mutiara)"
handler.importSource = "umi"
handler.importConfig = {"name": "islami", "alias": ["asmaulhusna", "niatsholat", "niatshalat", "surah", "doa", "berdoa", "gislam"], "category": "religi", "description": "Kumpulan fitur Islami (Asmaul Husna, Niat Sholat, Surah, Doa, Artikel, Kata Mutiara)", "usage": ".islami <fitur>", "isGroup": false, "isBotAdmin": false, "isAdmin": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-religi-islami": "islami", "umi-islami": "islami", "umi-niatsholat": "niatsholat", "umi-niatshalat": "niatshalat", "umi-doa": "doa", "umi-berdoa": "berdoa", "umi-gislam": "gislam", "islami": "islami", "niatsholat": "niatsholat", "niatshalat": "niatshalat", "berdoa": "berdoa", "gislam": "gislam"}
export default handler
