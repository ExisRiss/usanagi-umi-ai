/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "addenergiall", "category": "owner", "aliasMap": {"umi-owner-addenergiall": "addenergiall", "umi-addenergiall": "addenergiall", "umi-addenergianall": "addenergianall", "umi-bonusenergiall": "bonusenergiall", "addenergiall": "addenergiall", "addenergianall": "addenergianall", "bonusenergiall": "bonusenergiall"}, "description": "Menambahkan limit/energi ke semua member grup", "usage": ".addenergiall <jumlah>", "example": ".addenergiall 50", "cooldown": 10, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/addlimitall.js", metadata, m, extra)
handler.help = ["umi-owner-addenergiall <jumlah>"]
handler.command = ["umi-owner-addenergiall", "umi-addenergiall", "umi-addenergianall", "umi-bonusenergiall", "addenergiall", "addenergianall", "bonusenergiall"]
handler.tags = ["owner"]
handler.description = "Menambahkan limit/energi ke semua member grup"
handler.importSource = "umi"
handler.importConfig = {"name": "addenergiall", "alias": ["addenergianall", "bonusenergiall"], "category": "owner", "description": "Menambahkan limit/energi ke semua member grup", "usage": ".addenergiall <jumlah>", "example": ".addenergiall 50", "isOwner": true, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 10, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-addenergiall": "addenergiall", "umi-addenergiall": "addenergiall", "umi-addenergianall": "addenergianall", "umi-bonusenergiall": "bonusenergiall", "addenergiall": "addenergiall", "addenergianall": "addenergianall", "bonusenergiall": "bonusenergiall"}
export default handler
