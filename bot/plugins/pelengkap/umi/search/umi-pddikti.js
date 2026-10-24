/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "pddikti", "category": "search", "aliasMap": {"umi-search-pddikti": "pddikti", "umi-pddikti": "pddikti", "umi-dikti": "dikti", "umi-carimahasiswa": "carimahasiswa", "pddikti": "pddikti", "dikti": "dikti", "carimahasiswa": "carimahasiswa"}, "description": "Cari data Mahasiswa, Dosen, PT, dan Prodi dari PDDIKTI", "usage": ".pddikti <mode> <query>", "example": ".pddikti all Gibran Khalil\n.pddikti detail <id_mahasiswa>", "cooldown": 15, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/search/pddikti.js", metadata, m, extra)
handler.help = ["umi-search-pddikti <mode> <query>"]
handler.command = ["umi-search-pddikti", "umi-pddikti", "umi-dikti", "umi-carimahasiswa", "pddikti", "dikti", "carimahasiswa"]
handler.tags = ["search"]
handler.description = "Cari data Mahasiswa, Dosen, PT, dan Prodi dari PDDIKTI"
handler.importSource = "umi"
handler.importConfig = {"name": "pddikti", "alias": ["dikti", "carimahasiswa"], "category": "search", "description": "Cari data Mahasiswa, Dosen, PT, dan Prodi dari PDDIKTI", "usage": ".pddikti <mode> <query>", "example": ".pddikti all Gibran Khalil\n.pddikti detail <id_mahasiswa>", "cooldown": 15, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-search-pddikti": "pddikti", "umi-pddikti": "pddikti", "umi-dikti": "dikti", "umi-carimahasiswa": "carimahasiswa", "pddikti": "pddikti", "dikti": "dikti", "carimahasiswa": "carimahasiswa"}
export default handler
