/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "mengapa", "category": "fun", "aliasMap": {"umi-fun-mengapa": "mengapa", "umi-mengapa": "mengapa", "umi-kenapa": "kenapa", "umi-why": "why"}, "description": "Tanya bot mengapa sesuatu", "usage": ".mengapa <pertanyaan>", "example": ".mengapa langit biru?", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/fun/mengapa.js", metadata, m, extra)
handler.help = ["umi-fun-mengapa <pertanyaan>"]
handler.command = ["umi-fun-mengapa", "umi-mengapa", "umi-kenapa", "umi-why"]
handler.tags = ["fun"]
handler.description = "Tanya bot mengapa sesuatu"
handler.importSource = "umi"
handler.importConfig = {"name": "mengapa", "alias": ["kenapa", "why"], "category": "fun", "description": "Tanya bot mengapa sesuatu", "usage": ".mengapa <pertanyaan>", "example": ".mengapa langit biru?", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-fun-mengapa": "mengapa", "umi-mengapa": "mengapa", "umi-kenapa": "kenapa", "umi-why": "why"}
export default handler
