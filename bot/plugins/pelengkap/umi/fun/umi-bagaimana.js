/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "bagaimana", "category": "fun", "aliasMap": {"umi-fun-bagaimana": "bagaimana", "umi-bagaimana": "bagaimana", "umi-gimana": "gimana", "umi-how": "how"}, "description": "Tanya bot bagaimana sesuatu", "usage": ".bagaimana <pertanyaan>", "example": ".bagaimana cara jadi sukses?", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/fun/bagaimana.js", metadata, m, extra)
handler.help = ["umi-fun-bagaimana <pertanyaan>"]
handler.command = ["umi-fun-bagaimana", "umi-bagaimana", "umi-gimana", "umi-how"]
handler.tags = ["fun"]
handler.description = "Tanya bot bagaimana sesuatu"
handler.importSource = "umi"
handler.importConfig = {"name": "bagaimana", "alias": ["gimana", "how"], "category": "fun", "description": "Tanya bot bagaimana sesuatu", "usage": ".bagaimana <pertanyaan>", "example": ".bagaimana cara jadi sukses?", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-fun-bagaimana": "bagaimana", "umi-bagaimana": "bagaimana", "umi-gimana": "gimana", "umi-how": "how"}
export default handler
