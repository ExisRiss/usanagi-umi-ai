import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "putus", "category": "fun", "aliasMap": {"umi-fun-putus": "putus", "umi-putus": "putus", "umi-breakup": "breakup"}, "description": "Memutuskan hubungan dengan pasangan", "usage": ".putus", "example": ".putus", "cooldown": 60, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/fun/putus.js", metadata, m, extra)
handler.help = ["umi-fun-putus"]
handler.command = ["umi-fun-putus", "umi-putus", "umi-breakup"]
handler.tags = ["fun"]
handler.description = "Memutuskan hubungan dengan pasangan"
handler.importSource = "umi"
handler.importConfig = {"name": "putus", "alias": ["breakup", "cerai"], "category": "fun", "description": "Memutuskan hubungan dengan pasangan", "usage": ".putus", "example": ".putus", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 60, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-fun-putus": "putus", "umi-putus": "putus", "umi-breakup": "breakup"}
export default handler
