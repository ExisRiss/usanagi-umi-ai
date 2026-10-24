/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "gachatomboy", "category": "fun", "aliasMap": {"umi-fun-gachatomboy": "gachatomboy", "umi-gachatomboy": "gachatomboy", "gachatomboy": "gachatomboy"}, "description": "Gacha char anime tomboy random 100+ karakter", "usage": ".gachatomboy"}
const handler = (m, extra) => runImportedFeature("umi", "plugins/fun/gachatomboy.js", metadata, m, extra)
handler.help = ["umi-fun-gachatomboy"]
handler.command = ["umi-fun-gachatomboy", "umi-gachatomboy", "gachatomboy"]
handler.tags = ["fun"]
handler.description = "Gacha char anime tomboy random 100+ karakter"
handler.importSource = "umi"
handler.importConfig = {"name": "gachatomboy", "category": "fun", "description": "Gacha char anime tomboy random 100+ karakter", "usage": ".gachatomboy", "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-fun-gachatomboy": "gachatomboy", "umi-gachatomboy": "gachatomboy", "gachatomboy": "gachatomboy"}
export default handler
