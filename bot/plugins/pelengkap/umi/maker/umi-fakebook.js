import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "fakebook", "category": "maker", "aliasMap": {"umi-maker-fakebook": "fakebook", "umi-fakebook": "fakebook", "umi-bookquote": "bookquote", "umi-quotebuku": "quotebuku", "umi-fakebuku": "fakebuku", "fakebook": "fakebook", "bookquote": "bookquote", "quotebuku": "quotebuku", "fakebuku": "fakebuku"}, "description": "Membuat gambar quote estetis gaya halaman buku", "usage": ".fakebook <teks>", "example": ".fakebook Mencintaimu adalah hal terindah yang pernah ada.", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/maker/fakebook.js", metadata, m, extra)
handler.help = ["umi-maker-fakebook <teks>"]
handler.command = ["umi-maker-fakebook", "umi-fakebook", "umi-bookquote", "umi-quotebuku", "umi-fakebuku", "fakebook", "bookquote", "quotebuku", "fakebuku"]
handler.tags = ["maker"]
handler.description = "Membuat gambar quote estetis gaya halaman buku"
handler.importSource = "umi"
handler.importConfig = {"name": "fakebook", "alias": ["bookquote", "quotebuku", "fakebuku"], "category": "maker", "description": "Membuat gambar quote estetis gaya halaman buku", "usage": ".fakebook <teks>", "example": ".fakebook Mencintaimu adalah hal terindah yang pernah ada.", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-maker-fakebook": "fakebook", "umi-fakebook": "fakebook", "umi-bookquote": "bookquote", "umi-quotebuku": "quotebuku", "umi-fakebuku": "fakebuku", "fakebook": "fakebook", "bookquote": "bookquote", "quotebuku": "quotebuku", "fakebuku": "fakebuku"}
export default handler
