import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "movieku", "category": "search", "aliasMap": {"umi-search-movieku": "movieku", "umi-movieku": "movieku", "umi-carifilm": "carifilm", "umi-carimovie": "carimovie", "movieku": "movieku", "carifilm": "carifilm", "carimovie": "carimovie"}, "description": "Cari dan tampilkan informasi film lengkap dari Movieku beserta link download dalam berbagai kualitas", "usage": ".movieku <judul film>", "example": ".movieku avengers", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/search/movieku.js", metadata, m, extra)
handler.help = ["umi-search-movieku <judul film>"]
handler.command = ["umi-search-movieku", "umi-movieku", "umi-carifilm", "umi-carimovie", "movieku", "carifilm", "carimovie"]
handler.tags = ["search"]
handler.description = "Cari dan tampilkan informasi film lengkap dari Movieku beserta link download dalam berbagai kualitas"
handler.importSource = "umi"
handler.importConfig = {"name": "movieku", "alias": ["movie", "film", "carifilm", "carimovie"], "category": "search", "description": "Cari dan tampilkan informasi film lengkap dari Movieku beserta link download dalam berbagai kualitas", "usage": ".movieku <judul film>", "example": ".movieku avengers", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-search-movieku": "movieku", "umi-movieku": "movieku", "umi-carifilm": "carifilm", "umi-carimovie": "carimovie", "movieku": "movieku", "carifilm": "carifilm", "carimovie": "carimovie"}
export default handler
