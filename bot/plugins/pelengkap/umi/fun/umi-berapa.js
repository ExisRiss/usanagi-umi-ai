/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "berapa", "category": "fun", "aliasMap": {"umi-fun-berapa": "berapa", "umi-berapa": "berapa", "umi-howmuch": "howmuch", "umi-howmany": "howmany"}, "description": "Tanya bot berapa sesuatu", "usage": ".berapa <pertanyaan>", "example": ".berapa umur jodohku?", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/fun/berapa.js", metadata, m, extra)
handler.help = ["umi-fun-berapa <pertanyaan>"]
handler.command = ["umi-fun-berapa", "umi-berapa", "umi-howmuch", "umi-howmany"]
handler.tags = ["fun"]
handler.description = "Tanya bot berapa sesuatu"
handler.importSource = "umi"
handler.importConfig = {"name": "berapa", "alias": ["howmuch", "howmany"], "category": "fun", "description": "Tanya bot berapa sesuatu", "usage": ".berapa <pertanyaan>", "example": ".berapa umur jodohku?", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-fun-berapa": "berapa", "umi-berapa": "berapa", "umi-howmuch": "howmuch", "umi-howmany": "howmany"}
export default handler
