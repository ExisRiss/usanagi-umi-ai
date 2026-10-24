/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "dimana", "category": "fun", "aliasMap": {"umi-fun-dimana": "dimana", "umi-dimana": "dimana", "umi-where": "where", "umi-mana": "mana"}, "description": "Tanya bot dimana sesuatu", "usage": ".dimana <pertanyaan>", "example": ".dimana jodohku berada?", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/fun/dimana.js", metadata, m, extra)
handler.help = ["umi-fun-dimana <pertanyaan>"]
handler.command = ["umi-fun-dimana", "umi-dimana", "umi-where", "umi-mana"]
handler.tags = ["fun"]
handler.description = "Tanya bot dimana sesuatu"
handler.importSource = "umi"
handler.importConfig = {"name": "dimana", "alias": ["where", "mana"], "category": "fun", "description": "Tanya bot dimana sesuatu", "usage": ".dimana <pertanyaan>", "example": ".dimana jodohku berada?", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-fun-dimana": "dimana", "umi-dimana": "dimana", "umi-where": "where", "umi-mana": "mana"}
export default handler
