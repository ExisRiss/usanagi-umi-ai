/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "mimpi", "category": "fun", "aliasMap": {"umi-fun-mimpi": "mimpi", "umi-dream": "dream", "umi-dreamworld": "dreamworld", "dream": "dream", "dreamworld": "dreamworld"}, "description": "Jelajahi dunia mimpimu berdasarkan nama", "usage": ".mimpi <nama>", "example": ".mimpi Keisya", "cooldown": 15, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/fun/mimpi.js", metadata, m, extra)
handler.help = ["umi-fun-mimpi <nama>"]
handler.command = ["umi-fun-mimpi", "umi-dream", "umi-dreamworld", "dream", "dreamworld"]
handler.tags = ["fun"]
handler.description = "Jelajahi dunia mimpimu berdasarkan nama"
handler.importSource = "umi"
handler.importConfig = {"name": "mimpi", "alias": ["dream", "dreamworld"], "category": "fun", "description": "Jelajahi dunia mimpimu berdasarkan nama", "usage": ".mimpi <nama>", "example": ".mimpi Keisya", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 15, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-fun-mimpi": "mimpi", "umi-dream": "dream", "umi-dreamworld": "dreamworld", "dream": "dream", "dreamworld": "dreamworld"}
export default handler
