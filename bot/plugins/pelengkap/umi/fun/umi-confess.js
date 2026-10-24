import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "confess", "category": "fun", "aliasMap": {"umi-fun-confess": "confess", "umi-confess": "confess", "umi-confession": "confession", "umi-menfess": "menfess", "umi-anonim": "anonim", "confess": "confess", "confession": "confession", "menfess": "menfess", "anonim": "anonim"}, "description": "Kirim pesan anonim ke seseorang", "usage": ".confess nomor|pesan", "example": ".confess 6281234567890|Hai, aku suka kamu!", "cooldown": 60, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/fun/confess.js", metadata, m, extra)
handler.help = ["umi-fun-confess nomor|pesan"]
handler.command = ["umi-fun-confess", "umi-confess", "umi-confession", "umi-menfess", "umi-anonim", "confess", "confession", "menfess", "anonim"]
handler.tags = ["fun"]
handler.description = "Kirim pesan anonim ke seseorang"
handler.importSource = "umi"
handler.importConfig = {"name": "confess", "alias": ["confession", "menfess", "anonim"], "category": "fun", "description": "Kirim pesan anonim ke seseorang", "usage": ".confess nomor|pesan", "example": ".confess 6281234567890|Hai, aku suka kamu!", "isOwner": false, "isPremium": true, "isGroup": false, "isPrivate": false, "cooldown": 60, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = true
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-fun-confess": "confess", "umi-confess": "confess", "umi-confession": "confession", "umi-menfess": "menfess", "umi-anonim": "anonim", "confess": "confess", "confession": "confession", "menfess": "menfess", "anonim": "anonim"}
export default handler
