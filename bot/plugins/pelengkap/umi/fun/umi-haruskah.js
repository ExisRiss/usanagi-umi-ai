import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "haruskah", "category": "fun", "aliasMap": {"umi-fun-haruskah": "haruskah", "umi-haruskah": "haruskah", "umi-harus": "harus", "umi-should": "should", "should": "should"}, "description": "Tanya bot haruskah sesuatu", "usage": ".haruskah <pertanyaan>", "example": ".haruskah aku menyatakan cinta?", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/fun/haruskah.js", metadata, m, extra)
handler.help = ["umi-fun-haruskah <pertanyaan>"]
handler.command = ["umi-fun-haruskah", "umi-haruskah", "umi-harus", "umi-should", "should"]
handler.tags = ["fun"]
handler.description = "Tanya bot haruskah sesuatu"
handler.importSource = "umi"
handler.importConfig = {"name": "haruskah", "alias": ["harus", "should"], "category": "fun", "description": "Tanya bot haruskah sesuatu", "usage": ".haruskah <pertanyaan>", "example": ".haruskah aku menyatakan cinta?", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-fun-haruskah": "haruskah", "umi-haruskah": "haruskah", "umi-harus": "harus", "umi-should": "should", "should": "should"}
export default handler
