/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "kapan", "category": "fun", "aliasMap": {"umi-fun-kapan": "kapan", "umi-kapan": "kapan", "umi-when": "when"}, "description": "Tanya bot kapan sesuatu", "usage": ".kapan <pertanyaan>", "example": ".kapan aku nikah?", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/fun/kapan.js", metadata, m, extra)
handler.help = ["umi-fun-kapan <pertanyaan>"]
handler.command = ["umi-fun-kapan", "umi-kapan", "umi-when"]
handler.tags = ["fun"]
handler.description = "Tanya bot kapan sesuatu"
handler.importSource = "umi"
handler.importConfig = {"name": "kapan", "alias": ["when"], "category": "fun", "description": "Tanya bot kapan sesuatu", "usage": ".kapan <pertanyaan>", "example": ".kapan aku nikah?", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-fun-kapan": "kapan", "umi-kapan": "kapan", "umi-when": "when"}
export default handler
